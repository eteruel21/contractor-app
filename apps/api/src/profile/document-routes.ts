import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authenticateRequest } from "../auth/authenticate.js";
import { uploadStorageFile } from "../storage/provider.js";

const MAX_PROFILE_DOCUMENT_BYTES =
  10 * 1024 * 1024;

const MAX_PROFILE_DOCUMENT_DATA_URL_CHARS =
  14_500_000;

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
] as const;

const uploadProfileDocumentSchema = z.object({
  documentType: z.enum([
    "identification",
    "operation_notice",
    "references",
    "address_proof"
  ]),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(allowedMimeTypes),
  fileData: z
    .string()
    .min(1)
    .max(MAX_PROFILE_DOCUMENT_DATA_URL_CHARS)
});

function decodeBase64File(
  fileData: string
): Buffer {
  const commaIndex = fileData.indexOf(",");
  const base64 =
    fileData.startsWith("data:") &&
    commaIndex >= 0
      ? fileData.slice(commaIndex + 1)
      : fileData;

  if (
    !base64 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
  ) {
    throw new Error(
      "El archivo no contiene base64 válido."
    );
  }

  return Buffer.from(base64, "base64");
}

export async function registerProfileDocumentRoutes(
  app: FastifyInstance
) {
  app.post(
    "/profile/documents",
    {
      preHandler: authenticateRequest,
      bodyLimit: 15 * 1024 * 1024,
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      const user = request.authenticatedUser;

      if (!user) {
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      const parsed =
        uploadProfileDocumentSchema.safeParse(
          request.body
        );

      if (!parsed.success) {
        return reply.status(400).send({
          message:
            "El documento no es válido. Usa PDF, JPG, PNG, WEBP, HEIC o HEIF."
        });
      }

      let buffer: Buffer;

      try {
        buffer = decodeBase64File(
          parsed.data.fileData
        );
      } catch {
        return reply.status(400).send({
          message:
            "No fue posible leer el documento seleccionado."
        });
      }

      if (
        buffer.length === 0 ||
        buffer.length >
          MAX_PROFILE_DOCUMENT_BYTES
      ) {
        return reply.status(413).send({
          message:
            "El documento debe pesar como máximo 10 MB."
        });
      }

      // Ruta determinista: sustituir el mismo tipo de documento
      // sobrescribe el archivo anterior y evita archivos huérfanos.
      const storagePath =
        `profile-documents/${user.id}/${parsed.data.documentType}`;

      await uploadStorageFile({
        storagePath,
        buffer,
        mimeType: parsed.data.mimeType
      });

      return reply.status(201).send({
        storagePath,
        fileName: parsed.data.fileName,
        mimeType: parsed.data.mimeType,
        fileSize: buffer.length
      });
    }
  );
}