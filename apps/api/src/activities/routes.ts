import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../auth/authenticate.js";
import { createActivitySchema, updateActivitySchema } from "./schemas.js";
import {
  createActivityService,
  deleteActivityService,
  getActivityService,
  listActivitiesService,
  updateActivityService
} from "./services.js";

const companyParamsSchema = z.object({
  companyId: z.string().uuid()
});

const activityParamsSchema = z.object({
  companyId: z.string().uuid(),
  activityId: z.string().uuid()
});

const listQuerySchema = z.object({
  date: z.string().optional(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional()
});

function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.authenticatedUser?.id;
  if (!userId) {
    reply.status(401).send({ message: "Se requiere autenticación." });
    return null;
  }
  return userId;
}

export async function registerActivityRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/companies/:companyId/activities",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "ID de empresa no válido." });
      }

      const query = listQuerySchema.parse(request.query || {});
      const activities = await listActivitiesService(userId, parsedParams.data.companyId, query);
      return { activities };
    }
  );

  app.post(
    "/companies/:companyId/activities",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "ID de empresa no válido." });
      }

      const bodyData = { ...(request.body as object), companyId: parsedParams.data.companyId };
      const parsedBody = createActivitySchema.safeParse(bodyData);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la actividad son inválidos.",
          errors: parsedBody.error.flatten().fieldErrors
        });
      }

      const activity = await createActivityService(userId, parsedBody.data);
      return reply.status(201).send({ activity });
    }
  );

  app.get(
    "/companies/:companyId/activities/:activityId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = activityParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const activity = await getActivityService(userId, parsedParams.data.activityId, parsedParams.data.companyId);
      if (!activity) {
        return reply.status(404).send({ message: "Actividad no encontrada." });
      }

      return { activity };
    }
  );

  app.put(
    "/companies/:companyId/activities/:activityId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = activityParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const parsedBody = updateActivitySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos a actualizar son inválidos.",
          errors: parsedBody.error.flatten().fieldErrors
        });
      }

      const updated = await updateActivityService(
        userId,
        parsedParams.data.activityId,
        parsedParams.data.companyId,
        parsedBody.data
      );
      return { activity: updated };
    }
  );

  app.delete(
    "/companies/:companyId/activities/:activityId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "supervisor"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = activityParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const success = await deleteActivityService(
        userId,
        parsedParams.data.activityId,
        parsedParams.data.companyId
      );
      if (!success) {
        return reply.status(404).send({ message: "Actividad no encontrada o ya eliminada." });
      }

      return { success: true };
    }
  );
}
