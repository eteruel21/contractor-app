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

export async function requireActiveUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = request.authenticatedUser;
  if (!user) {
    reply.status(401).send({
      message: "Se requiere autenticación."
    });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.user_id', $1, true)", [user.id]);
    const result = await client.query<{
      email_confirmed_at: Date | null;
      deleted_at: Date | null;
      active: boolean;
      approved_at: Date | null;
    }>(
      `
        SELECT
          u.email_confirmed_at,
          u.deleted_at,
          p.active,
          p.approved_at
        FROM app_auth.users u
        LEFT JOIN public.profiles p ON p.id = u.id
        WHERE u.id = $1
        LIMIT 1
      `,
      [user.id]
    );
    await client.query("COMMIT");

    const record = result.rows[0];
    if (process.env.NODE_ENV !== "production") {
      console.log(`[requireActiveUser DEBUG] userId=${user.id} record=`, record);
    }
    if (!record) {
      reply.status(403).send({
        message: "No se encontró el perfil del usuario."
      });
      return;
    }

    if (record.deleted_at) {
      reply.status(403).send({
        message: "Esta cuenta ha sido eliminada o desactivada."
      });
      return;
    }

    if (!record.email_confirmed_at) {
      reply.status(403).send({
        message: "Debes confirmar tu correo electrónico para acceder a esta ruta."
      });
      return;
    }

    if (!record.approved_at) {
      reply.status(403).send({
        message: "Tu cuenta está pendiente de aprobación por el administrador."
      });
      return;
    }

    if (!record.active) {
      reply.status(403).send({
        message: "Tu cuenta está suspendida o inactiva."
      });
      return;
    }
  } catch (error) {
    request.log.error(error);
    reply.status(500).send({
      message: "Error interno al verificar el estado del usuario."
    });
  } finally {
    client.release();
  }
}

export function requireCompanyRole(allowedRoles: ("owner" | "admin" | "estimator" | "sales" | "supervisor" | "member")[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.authenticatedUser?.id;
    if (!userId) {
      reply.status(401).send({ message: "Se requiere autenticación." });
      return;
    }

    let companyId: string | undefined = 
      (request.params as any)?.companyId ||
      ((request.url.startsWith("/companies") || request.url.includes("/companies/")) ? (request.params as any)?.id : undefined) ||
      (request.query as any)?.companyId ||
      (request.body as any)?.companyId ||
      request.headers["x-company-id"] as string;

    if (!companyId) {
      reply.status(400).send({ message: "Identificador de empresa (companyId) es obligatorio." });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
      const result = await client.query<{
        role: string;
        active: boolean;
      }>(
        `
          SELECT role, active
          FROM public.company_members
          WHERE company_id = $1
            AND user_id = $2
            AND active = true
          LIMIT 1
        `,
        [companyId, userId]
      );
      await client.query("COMMIT");

      const membership = result.rows[0];
      if (!membership) {
        reply.status(403).send({ message: "No eres miembro de esta empresa." });
        return;
      }

      if (!allowedRoles.includes(membership.role as any)) {
        reply.status(403).send({ message: "No tienes permiso para realizar esta acción." });
        return;
      }
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ message: "Error interno al verificar los permisos del rol." });
    } finally {
      client.release();
    }
  };
}