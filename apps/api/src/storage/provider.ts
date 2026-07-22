import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type S3ClientConfig
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { generateSignedPhotoUrl } from "./signed-url.js";

type UploadInput = {
  storagePath: string;
  buffer: Buffer;
  mimeType: string;
};

function createS3Client(): S3Client | null {
  if (env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
    const config: S3ClientConfig = {
      region: env.S3_REGION || "auto",
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY
      }
    };
    if (env.S3_ENDPOINT) {
      config.endpoint = env.S3_ENDPOINT;
    }
    return new S3Client(config);
  }
  return null;
}

const s3Client = createS3Client();
const uploadsLocalDir = path.join(process.cwd(), "storage", "uploads");

export function sanitizeExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"];
  return allowed.includes(ext) ? ext : ".jpg";
}

export function buildSecureStorageKey(companyId: string, projectId: string, originalFileName: string): string {
  const safeExt = sanitizeExtension(originalFileName);
  const fileUuid = crypto.randomUUID();
  return `projects/${companyId}/${projectId}/${fileUuid}${safeExt}`;
}

export async function uploadStorageFile({ storagePath, buffer, mimeType }: UploadInput): Promise<void> {
  if (s3Client) {
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storagePath,
      Body: buffer,
      ContentType: mimeType,
      ACL: "private"
    });
    await s3Client.send(command);
    return;
  }

  // Fallback storage driver for local dev and tests
  const fullPath = path.join(uploadsLocalDir, storagePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
}

export async function downloadStorageFile(storagePath: string): Promise<{ buffer: Buffer; mimeType?: string | undefined }> {
  if (s3Client) {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storagePath
    });
    const response = await s3Client.send(command);
    const byteArray = await response.Body?.transformToByteArray();
    return {
      buffer: Buffer.from(byteArray || new Uint8Array()),
      mimeType: response.ContentType
    };
  }

  const fullPath = path.join(uploadsLocalDir, storagePath);
  const buffer = await fs.readFile(fullPath);
  return { buffer };
}

export async function deleteStorageFile(storagePath: string): Promise<void> {
  if (s3Client) {
    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storagePath
    });
    await s3Client.send(command);
    return;
  }

  try {
    const fullPath = path.join(uploadsLocalDir, storagePath);
    await fs.unlink(fullPath);
  } catch {
    // File may already be deleted
  }
}

export async function getStorageSignedUrl(photoId: string, storagePath: string, expiresInMinutes: number = 60): Promise<string> {
  if (s3Client) {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storagePath
    });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInMinutes * 60 });
  }

  return generateSignedPhotoUrl(photoId, expiresInMinutes);
}
