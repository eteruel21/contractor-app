import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { env } from "../config/env.js";
import { generateSignedPhotoUrl } from "./signed-url.js";

type UploadInput = {
  storagePath: string;
  buffer: Buffer;
  mimeType: string;
};

type R2ObjectBodyLike = {
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: {
    contentType?: string;
  };
};

type R2BucketBinding = {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
    }
  ): Promise<unknown>;

  get(key: string): Promise<R2ObjectBodyLike | null>;

  delete(key: string | string[]): Promise<void>;
};

let r2Bucket: R2BucketBinding | null = null;

const uploadsLocalDir = path.join(
  process.cwd(),
  "storage",
  "uploads"
);

function requiresR2Storage(): boolean {
  return (
    env.NODE_ENV === "production" ||
    env.NODE_ENV === "staging"
  );
}

function assertLocalStorageAllowed(): void {
  if (requiresR2Storage()) {
    throw new Error(
      "R2_STORAGE es obligatorio en staging y producción."
    );
  }
}

export function configureR2Storage(
  bucket: R2BucketBinding | null | undefined
): void {
  r2Bucket = bucket ?? null;
}

export function isObjectStorageConfigured(): boolean {
  return r2Bucket !== null;
}

export function sanitizeExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  const allowed = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".pdf"
  ];

  return allowed.includes(ext) ? ext : ".jpg";
}

export function buildSecureStorageKey(
  companyId: string,
  projectId: string,
  originalFileName: string
): string {
  const safeExt = sanitizeExtension(originalFileName);
  const fileUuid = crypto.randomUUID();

  return `projects/${companyId}/${projectId}/${fileUuid}${safeExt}`;
}

export async function uploadStorageFile({
  storagePath,
  buffer,
  mimeType
}: UploadInput): Promise<void> {
  if (r2Bucket) {
    await r2Bucket.put(
      storagePath,
      buffer,
      {
        httpMetadata: {
          contentType: mimeType
        }
      }
    );

    return;
  }

  assertLocalStorageAllowed();

  const fullPath = path.join(
    uploadsLocalDir,
    storagePath
  );

  await fs.mkdir(
    path.dirname(fullPath),
    { recursive: true }
  );

  await fs.writeFile(
    fullPath,
    buffer
  );
}

export async function downloadStorageFile(
  storagePath: string
): Promise<{
  buffer: Buffer;
  mimeType?: string | undefined;
}> {
  if (r2Bucket) {
    const object = await r2Bucket.get(storagePath);

    if (!object) {
      throw new Error(
        "Archivo no encontrado en R2."
      );
    }

    const arrayBuffer =
      await object.arrayBuffer();

    return {
      buffer: Buffer.from(arrayBuffer),
      mimeType:
        object.httpMetadata?.contentType
    };
  }

  assertLocalStorageAllowed();

  const fullPath = path.join(
    uploadsLocalDir,
    storagePath
  );

  const buffer = await fs.readFile(fullPath);

  return { buffer };
}

export async function deleteStorageFile(
  storagePath: string
): Promise<void> {
  if (r2Bucket) {
    await r2Bucket.delete(storagePath);
    return;
  }

  assertLocalStorageAllowed();

  try {
    const fullPath = path.join(
      uploadsLocalDir,
      storagePath
    );

    await fs.unlink(fullPath);
  } catch {
    // El archivo local puede haber sido eliminado previamente.
  }
}

export async function getStorageSignedUrl(
  photoId: string,
  _storagePath: string,
  expiresInMinutes: number = 60
): Promise<string> {
  return generateSignedPhotoUrl(
    photoId,
    expiresInMinutes
  );
}
