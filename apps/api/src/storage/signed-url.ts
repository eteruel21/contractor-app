import { SignJWT, jwtVerify } from "jose";
import { env } from "../config/env.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function generateSignedPhotoUrl(photoId: string, expiresInMinutes: number = 60): Promise<string> {
  const token = await new SignJWT({ photoId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInMinutes}m`)
    .sign(secret);

  return `/api/storage/files/${photoId}?token=${token}`;
}

export async function verifyPhotoToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.photoId === "string" ? payload.photoId : null;
  } catch {
    return null;
  }
}
