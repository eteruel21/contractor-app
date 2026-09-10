import bcrypt from "bcryptjs";
import type { FastifyRequest } from "fastify";
import { env } from "../config/env.js";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

function allowedTurnstileHostnames(): string[] {
  return (env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifyCaptcha(token: string, ip: string, expectedAction: string): Promise<boolean> {

const secret = env.TURNSTILE_SECRET_KEY;
  const allowedHostnames = allowedTurnstileHostnames();

  if (!secret || allowedHostnames.length === 0) {
    return false;
  }

  if (!token || token === "mock-captcha-token") {
    return false;
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    body.set("remoteip", ip);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as TurnstileResponse;

    if (!data.success) {
      return false;
    }

    const hostname = data.hostname?.trim().toLowerCase();
    if (!hostname || !allowedHostnames.includes(hostname)) {
      return false;
    }

    if (data.action !== expectedAction) {
      return false;
    }

    return true;
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
