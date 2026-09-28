import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../auth/authenticate.js";
import { createProjectPhotoRepo, deleteProjectPhotoRepo, findProjectPhotosRepo } from "./repository.js";
import {
  buildSecureStorageKey,
  uploadStorageFile,
  downloadStorageFile,
  deleteStorageFile,
  getStorageSignedUrl
} from "./provider.js";
import {
  verifyPhotoToken,
  verifyProfileDocumentToken
} from "./signed-url.js";
import { pool } from "../db/pool.js";

const uploadPhotoSchema = z.object({
  fileName: z.string().min(1),
  fileData: z.string().min(1), // Base64 encoded string
  mimeType: z.string().default("image/jpeg"),
  caption: z.string().optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  isPrivate: z.boolean().default(true)
});

const projectParamsSchema = z.object({
  companyId: z.string().uuid(),
  projectId: z.string().uuid()
});

const photoParamsSchema = z.object({
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  photoId: z.string().uuid()
});

const profileDocumentParamsSchema = z.object({
  userId: z.string().uuid(),
  documentType: z.enum([
    "identification",
    "operation_notice",
    "references",
    "address_proof"
  ])
});

const profileDocumentFileNames = {
  identification: "identificacion",
  operation_notice: "aviso-operacion",
  references: "referencias",
  address_proof: "comprobante-domicilio"
} as const;

function extensionForMimeType(mimeType?: string): string {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/heic":
      return ".heic";
    case "image/heif":
      return ".heif";
    default:
      return "";
  }
}

function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.authenticatedUser?.id;
  if (!userId) {
    reply.status(401).send({ message: "Se requiere autenticación." });
    return null;
  }
  return userId;
}

export async function registerStorageRoutes(app: FastifyInstance): Promise<void> {
  // List photos with signed URLs
  app.get(
    "/companies/:companyId/projects/:projectId/photos",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = projectParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const photos = await findProjectPhotosRepo(userId, parsedParams.data.companyId, parsedParams.data.projectId);

      const photosWithSignedUrls = await Promise.all(
        photos.map(async (photo) => ({
          ...photo,
          signedUrl: await getStorageSignedUrl(photo.id, photo.storage_path, 60)
        }))
      );

      return { photos: photosWithSignedUrls };
    }
  );

  // Upload photo to private storage (R2/S3 or local fallback) with secure UUID storagePath
  app.post(
    "/companies/:companyId/projects/:projectId/photos",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = projectParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const parsedBody = uploadPhotoSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la foto son inválidos.",
          errors: parsedBody.error.flatten().fieldErrors
        });
      }

      const buffer = Buffer.from(parsedBody.data.fileData.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const storagePath = buildSecureStorageKey(parsedParams.data.companyId, parsedParams.data.projectId, parsedBody.data.fileName);

      await uploadStorageFile({
        storagePath,
        buffer,
        mimeType: parsedBody.data.mimeType
      });

      const photoRecord = await createProjectPhotoRepo(userId, {
        companyId: parsedParams.data.companyId,
        projectId: parsedParams.data.projectId,
        taskId: parsedBody.data.taskId,
        storagePath,
        fileName: parsedBody.data.fileName,
        fileSize: buffer.length,
        mimeType: parsedBody.data.mimeType,
        caption: parsedBody.data.caption,
        isPrivate: parsedBody.data.isPrivate
      });

      const signedUrl = await getStorageSignedUrl(photoRecord.id, photoRecord.storage_path, 60);
      return reply.status(201).send({ photo: { ...photoRecord, signedUrl } });
    }
  );

  // Delete photo from storage
  app.delete(
    "/companies/:companyId/projects/:projectId/photos/:photoId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "supervisor"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = photoParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const deleted = await deleteProjectPhotoRepo(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.projectId,
        parsedParams.data.photoId
      );

      if (!deleted) {
        return reply.status(404).send({ message: "Foto no encontrada." });
      }

      await deleteStorageFile(deleted.storage_path);
      return { success: true };
    }
  );

  // Serve private file via signed token
  app.get("/storage/files/:photoId", async (request, reply) => {
    const { photoId } = request.params as { photoId: string };
    const { token } = request.query as { token?: string };

    if (!token) {
      return reply.status(401).send({ message: "Token firmado requerido." });
    }

    const verifiedPhotoId = await verifyPhotoToken(token);
    if (!verifiedPhotoId || verifiedPhotoId !== photoId) {
      return reply.status(403).send({ message: "URL firmada inválida o expirada." });
    }

    const result = await pool.query(
      `SELECT * FROM public.project_photos WHERE id = $1 LIMIT 1`,
      [photoId]
    );

    const photo = result.rows[0];
    if (!photo) {
      return reply.status(404).send({ message: "Archivo no encontrado." });
    }

    try {
      const { buffer, mimeType } = await downloadStorageFile(photo.storage_path);
      return reply
        .header("Content-Type", photo.mime_type || mimeType || "image/jpeg")
        .header("Cache-Control", "private, max-age=3600")
        .send(buffer);
    } catch {
      return reply.status(404).send({ message: "Archivo no disponible en el almacenamiento físico o R2/S3." });
    }
  });

  // Sirve únicamente el documento exacto autorizado por una URL firmada y
  // breve. El token liga usuario y tipo; nunca acepta una ruta de storage.
  app.get(
    "/storage/profile-documents/:userId/:documentType",
    async (request, reply) => {
      const params = profileDocumentParamsSchema.safeParse(request.params);
      const token = (request.query as { token?: unknown }).token;

      if (!params.success || typeof token !== "string" || !token) {
        return reply.status(401).send({
          message: "URL firmada requerida."
        });
      }

      const valid = await verifyProfileDocumentToken(
        token,
        params.data.userId,
        params.data.documentType
      );

      if (!valid) {
        return reply.status(403).send({
          message: "URL firmada inválida o expirada."
        });
      }

      const storagePath =
        `profile-documents/${params.data.userId}/${params.data.documentType}`;

      try {
        const { buffer, mimeType } = await downloadStorageFile(storagePath);
        const contentType = mimeType || "application/octet-stream";
        const fileName =
          `${profileDocumentFileNames[params.data.documentType]}${extensionForMimeType(mimeType)}`;

        return reply
          .header("Content-Type", contentType)
          .header(
            "Content-Disposition",
            `inline; filename="${fileName}"`
          )
          .header("Cache-Control", "private, no-store")
          .send(buffer);
      } catch {
        return reply.status(404).send({
          message: "Archivo no disponible."
        });
      }
    }
  );
}
