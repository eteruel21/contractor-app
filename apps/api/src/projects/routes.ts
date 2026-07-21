import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";

import {
  authenticateRequest,
  requireActiveUser,
  requireCompanyRole
} from "../auth/authenticate.js";

import {
  projectParamsSchema,
  projectQuerySchema,
  companyQuerySchema,
  createProjectSchema,
  statusSchema,
  progressSchema
} from "./schemas.js";

import {
  getClientProjectsService,
  getCompanyProjectsService,
  createProjectService,
  getProjectByIdService,
  updateProjectStatusService,
  updateProjectProgressService
} from "./services.js";

function authenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
): string | null {
  const userId = request.authenticatedUser?.id;

  if (!userId) {
    reply.status(401).send({
      message: "Se requiere autenticación."
    });
    return null;
  }

  return userId;
}

export async function registerProjectRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/projects/client",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const projects = await getClientProjectsService(userId);
      return { projects };
    }
  );

  app.get(
    "/projects",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedQuery = projectQuerySchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({
          message: "La empresa o el cliente no son válidos."
        });
      }

      const projects = await getCompanyProjectsService(userId, parsedQuery.data.companyId, parsedQuery.data.clientId);
      return { projects };
    }
  );

  app.post(
    "/projects",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createProjectSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del proyecto no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const project = await createProjectService(userId, parsedBody.data);

      if (!project) {
        return reply.status(500).send({
          message: "No se pudo crear el proyecto."
        });
      }

      return reply.status(201).send({ project });
    }
  );

  app.get(
    "/projects/:projectId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = projectParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({
          message: "El proyecto o la empresa no son válidos."
        });
      }

      const project = await getProjectByIdService(userId, parsedParams.data.projectId, parsedQuery.data.companyId);

      if (!project) {
        return reply.status(404).send({
          message: "No se encontró el proyecto."
        });
      }

      return { project };
    }
  );

  app.patch(
    "/projects/:projectId/status",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = projectParamsSchema.safeParse(request.params);
      const parsedBody = statusSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "El estado del proyecto no es válido."
        });
      }

      await updateProjectStatusService(userId, parsedParams.data.projectId, parsedBody.data.companyId, parsedBody.data.status);
      return { success: true };
    }
  );

  app.patch(
    "/projects/:projectId/progress",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = projectParamsSchema.safeParse(request.params);
      const parsedBody = progressSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "El avance del proyecto no es válido."
        });
      }

      await updateProjectProgressService(userId, parsedParams.data.projectId, parsedBody.data.companyId, parsedBody.data.progressPercentage);
      return { success: true };
    }
  );
}