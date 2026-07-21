import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../auth/authenticate.js";
import { findUserNotificationsRepo, markNotificationAsReadRepo } from "./repository.js";

const companyParamsSchema = z.object({
  companyId: z.string().uuid()
});

const notificationParamsSchema = z.object({
  companyId: z.string().uuid(),
  notificationId: z.string().uuid()
});

function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.authenticatedUser?.id;
  if (!userId) {
    reply.status(401).send({ message: "Se requiere autenticación." });
    return null;
  }
  return userId;
}

export async function registerNotificationRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/companies/:companyId/notifications",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const notifications = await findUserNotificationsRepo(userId, parsedParams.data.companyId);
      return { notifications };
    }
  );

  app.patch(
    "/companies/:companyId/notifications/:notificationId/read",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = notificationParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const notification = await markNotificationAsReadRepo(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.notificationId
      );

      if (!notification) {
        return reply.status(404).send({ message: "Notificación no encontrada." });
      }

      return { notification };
    }
  );
}
