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
  companyParamsSchema,
  createCompanySchema,
  billingSchema
} from "./schemas.js";

import {
  getUserCompanyMembershipsService,
  createCompanyService,
  updateCompanyBillingService
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

export async function registerCompanyRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/companies",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const memberships = await getUserCompanyMembershipsService(userId);
      return { memberships };
    }
  );

  app.post(
    "/companies",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createCompanySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la empresa no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const companyId = await createCompanyService(userId, parsedBody.data);

      if (!companyId) {
        return reply.status(500).send({
          message: "No se pudo crear la empresa."
        });
      }

      return reply.status(201).send({ companyId });
    }
  );

  app.patch(
    "/companies/:companyId/billing",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = companyParamsSchema.safeParse(request.params);
      const parsedBody = billingSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de facturación no son válidos."
        });
      }

      const company = await updateCompanyBillingService(userId, parsedParams.data.companyId, parsedBody.data);

      if (!company) {
        return reply.status(404).send({
          message: "No se encontró la empresa o no tienes permiso para editarla."
        });
      }

      return { success: true };
    }
  );
}