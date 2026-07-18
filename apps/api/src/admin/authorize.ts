import type {
  FastifyReply,
  FastifyRequest
} from "fastify";

import {
  authenticateRequest
} from "../auth/authenticate.js";
import {
  withUserTransaction
} from "../db/with-user-transaction.js";

export async function requireSuperAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authenticateRequest(
    request,
    reply
  );

  if (reply.sent) return;

  const userId =
    request.authenticatedUser?.id;

  if (!userId) {
    reply.status(401).send({
      message:
        "Se requiere autenticación."
    });

    return;
  }

  const authorized =
    await withUserTransaction(
      userId,
      async (client) => {
        const result =
          await client.query<{
            authorized: boolean;
          }>(`
            SELECT EXISTS (
              SELECT 1
              FROM public.profiles
              WHERE id =
                app.current_user_id()
                AND role =
                  'super_admin'
                AND active = true
            ) AS authorized
          `);

        return Boolean(
          result.rows[0]?.authorized
        );
      }
    );

  if (!authorized) {
    reply.status(403).send({
      message:
        "Esta cuenta no tiene acceso de superadministrador."
    });
  }
}