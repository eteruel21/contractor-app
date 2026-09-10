import type { FastifyRequest } from "fastify";
import { isIP } from "node:net";
import { env } from "../config/env.js";

export function getClientIp(request: FastifyRequest): string {
  const trustCloudflare =
    env.NODE_ENV === "production" || env.NODE_ENV === "staging";

  if (trustCloudflare) {
    const rawHeader = request.headers["cf-connecting-ip"];
    const candidate = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    const normalized = candidate?.trim();

    if (normalized && isIP(normalized) !== 0) {
      return normalized;
    }
  }

  return request.ip;
}
