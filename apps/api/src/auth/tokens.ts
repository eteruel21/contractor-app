import {
  createHash,
  randomBytes,
  randomUUID
} from "node:crypto";

import {
  jwtVerify,
  SignJWT
} from "jose";

import { env } from "../config/env.js";

const jwtSecret = new TextEncoder().encode(
  env.JWT_SECRET
);

export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
};

export async function createAccessToken(
  userId: string,
  sessionId: string
): Promise<string> {
  return new SignJWT({
    type: "access",
    sessionId
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT"
    })
    .setSubject(userId)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(
      `${env.ACCESS_TOKEN_MINUTES}m`
    )
    .setJti(randomUUID())
    .sign(jwtSecret);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(
    token,
    jwtSecret,
    {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithms: ["HS256"]
    }
  );

  if (
    payload.type !== "access" ||
    typeof payload.sub !== "string" ||
    typeof payload.sessionId !== "string"
  ) {
    throw new Error("Token de acceso inválido.");
  }

  return {
    userId: payload.sub,
    sessionId: payload.sessionId
  };
}

export function createRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(
  token: string
): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export function generateSecureToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export function hashSecureToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}