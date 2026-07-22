import bcrypt from "bcryptjs";
import type { FastifyRequest } from "fastify";
import { env } from "../config/env.js";

export async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  if (env.NODE_ENV === "test") {
    return true;
  }

  const secret = env.CAPTCHA_SECRET;
  if (!secret) return true;

  if (!token || token === "mock-captcha-token") {
    return false;
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(ip)}`
    });
    const data = (await response.json()) as { success: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export function requestUserAgent(request: FastifyRequest): string | null {
  const userAgent = request.headers["user-agent"];
  return typeof userAgent === "string" ? userAgent : null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
