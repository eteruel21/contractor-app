import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../auth/authenticate.js";
import {
  deletePushTokenRepo,
  findUserNotificationsRepo,
  markNotificationAsReadRepo,
  upsertPushTokenRepo
} from "./repository.js";

const companyParamsSchema = z.object({
  companyId: z.string().uuid()
});

const notificationParamsSchema = z.object({
  companyId: z.string().uuid(),
  notificationId: z.string().uuid()
});

const upsertPushTokenSchema = z.object({
  expoPushToken: z.string().trim().min(5).max(500),
  devicePlatform: z.string().trim().max(50).optional().default("unknown")
});

const deletePushTokenSchema = z.object({
  expoPushToken: z.string().trim().min(5).max(500)
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

  app.post(
    "/push-tokens",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = upsertPushTokenSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "Los datos del token push no son válidos." });
      }

      const tokenRecord = await upsertPushTokenRepo(
        userId,
        parsedBody.data.expoPushToken,
        parsedBody.data.devicePlatform
      );

      return reply.status(201).send({ success: true, token: tokenRecord });
    }
  );

  app.delete(
    "/push-tokens",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = deletePushTokenSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "El token push no es válido." });
      }

      const deleted = await deletePushTokenRepo(userId, parsedBody.data.expoPushToken);
      return { success: deleted };
    }
  );
}

