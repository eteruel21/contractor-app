import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../../auth/authenticate.js";
import { addProgressHistorySchema } from "./schemas.js";
import {
  listProjectProgressHistoryService,
  recordProjectProgressHistoryService
} from "./services.js";

const projectParamsSchema = z.object({
  companyId: z.string().uuid(),
  projectId: z.string().uuid()
});

function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.authenticatedUser?.id;
  if (!userId) {
    reply.status(401).send({ message: "Se requiere autenticación." });
    return null;
  }
  return userId;
}

export async function registerProjectProgressRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/companies/:companyId/projects/:projectId/progress-history",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = projectParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const history = await listProjectProgressHistoryService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.projectId
      );
      return { history };
    }
  );

  app.post(
    "/companies/:companyId/projects/:projectId/progress-history",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "supervisor"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = projectParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const parsedBody = addProgressHistorySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de avance son inválidos.",
          errors: parsedBody.error.flatten().fieldErrors
        });
      }

      const record = await recordProjectProgressHistoryService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.projectId,
        parsedBody.data.progressPercentage,
        parsedBody.data.notes
      );
      return reply.status(201).send({ record });
    }
  );
}
