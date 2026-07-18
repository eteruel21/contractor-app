import type {
  FastifyReply,
  FastifyRequest
} from "fastify";

import { pool } from "../db/pool.js";
import {
  verifyAccessToken
} from "./tokens.js";

declare module "fastify" {
  interface FastifyRequest {
    authenticatedUser: {
      id: string;
      sessionId: string;
    } | null;
  }
}

export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authorization =
    request.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    reply.status(401).send({
      message: "Se requiere autenticación."
    });

    return;
  }

  const token = authorization.slice(
    "Bearer ".length
  );

  try {
    const payload = await verifyAccessToken(token);

    const sessionResult = await pool.query<{
      id: string;
    }>(
      `
        SELECT id
        FROM app_auth.sessions
        WHERE id = $1
          AND user_id = $2
          AND revoked_at IS NULL
          AND expires_at > now()
        LIMIT 1
      `,
      [
        payload.sessionId,
        payload.userId
      ]
    );

    if (!sessionResult.rows[0]) {
      reply.status(401).send({
        message:
          "La sesión expiró o fue cerrada."
      });

      return;
    }

    request.authenticatedUser = {
      id: payload.userId,
      sessionId: payload.sessionId
    };
  } catch {
    reply.status(401).send({
      message:
        "El token es inválido o ha expirado."
    });
  }
}