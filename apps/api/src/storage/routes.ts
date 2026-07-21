import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../auth/authenticate.js";
import { createProjectPhotoRepo, deleteProjectPhotoRepo, findProjectPhotosRepo, getPhotoByIdRepo } from "./repository.js";
import { generateSignedPhotoUrl, verifyPhotoToken } from "./signed-url.js";
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

function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.authenticatedUser?.id;
  if (!userId) {
    reply.status(401).send({ message: "Se requiere autenticación." });
    return null;
  }
  return userId;
}

export async function registerStorageRoutes(app: FastifyInstance): Promise<void> {
  const uploadsDir = path.join(process.cwd(), "storage", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

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
          signedUrl: await generateSignedPhotoUrl(photo.id, 60)
        }))
      );

      return { photos: photosWithSignedUrls };
    }
  );

  // Upload photo to private storage
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
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${parsedBody.data.fileName}`;
      const relativePath = path.join(parsedParams.data.companyId, parsedParams.data.projectId, fileId);
      const fullPath = path.join(uploadsDir, relativePath);

      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, buffer);

      const photoRecord = await createProjectPhotoRepo(userId, {
        companyId: parsedParams.data.companyId,
        projectId: parsedParams.data.projectId,
        taskId: parsedBody.data.taskId,
        storagePath: relativePath,
        fileName: parsedBody.data.fileName,
        fileSize: buffer.length,
        mimeType: parsedBody.data.mimeType,
        caption: parsedBody.data.caption,
        isPrivate: parsedBody.data.isPrivate
      });

      const signedUrl = await generateSignedPhotoUrl(photoRecord.id, 60);
      return reply.status(201).send({ photo: { ...photoRecord, signedUrl } });
    }
  );

  // Delete photo
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

      try {
        const fullPath = path.join(uploadsDir, deleted.storage_path);
        await fs.unlink(fullPath);
      } catch {
        // File may have been removed already
      }

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

    const fullPath = path.join(uploadsDir, photo.storage_path);
    try {
      const fileBuffer = await fs.readFile(fullPath);
      return reply
        .header("Content-Type", photo.mime_type || "image/jpeg")
        .header("Cache-Control", "private, max-age=3600")
        .send(fileBuffer);
    } catch {
      return reply.status(404).send({ message: "Archivo no disponible en el almacenamiento físico." });
    }
  });
}
