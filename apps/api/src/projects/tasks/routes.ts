import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../../auth/authenticate.js";
import { createTaskSchema, updateTaskSchema } from "./schemas.js";
import {
  createTaskService,
  deleteTaskService,
  listProjectTasksService,
  updateTaskService
} from "./services.js";

const projectParamsSchema = z.object({
  companyId: z.string().uuid(),
  projectId: z.string().uuid()
});

const taskParamsSchema = z.object({
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  taskId: z.string().uuid()
});

function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.authenticatedUser?.id;
  if (!userId) {
    reply.status(401).send({ message: "Se requiere autenticación." });
    return null;
  }
  return userId;
}

export async function registerProjectTaskRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/companies/:companyId/projects/:projectId/tasks",
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

      const tasks = await listProjectTasksService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.projectId
      );
      return { tasks };
    }
  );

  app.post(
    "/companies/:companyId/projects/:projectId/tasks",
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

      const parsedBody = createTaskSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la tarea son inválidos.",
          errors: parsedBody.error.flatten().fieldErrors
        });
      }

      const task = await createTaskService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.projectId,
        parsedBody.data
      );
      return reply.status(201).send({ task });
    }
  );

  app.put(
    "/companies/:companyId/projects/:projectId/tasks/:taskId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = taskParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const parsedBody = updateTaskSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos a actualizar son inválidos.",
          errors: parsedBody.error.flatten().fieldErrors
        });
      }

      const updated = await updateTaskService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.projectId,
        parsedParams.data.taskId,
        parsedBody.data
      );
      return { task: updated };
    }
  );

  app.delete(
    "/companies/:companyId/projects/:projectId/tasks/:taskId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "supervisor"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = taskParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Parámetros inválidos." });
      }

      const success = await deleteTaskService(
        userId,
        parsedParams.data.companyId,
        parsedParams.data.projectId,
        parsedParams.data.taskId
      );
      if (!success) {
        return reply.status(404).send({ message: "Tarea no encontrada o eliminada." });
      }

      return { success: true };
    }
  );
}
