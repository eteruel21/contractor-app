import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authenticateRequest, requireActiveUser, requireCompanyRole } from "../auth/authenticate.js";
import { companyQuerySchema } from "../budgets/schemas.js";
import {
  calculationParamsSchema,
  listCalculationsSchema,
  saveCalculationSchema
} from "./schemas.js";
import {
  saveCalculationService,
  getCompanyCalculationsService,
  getCalculationDetailService,
  deleteCalculationService
} from "./services.js";

function authenticatedUserId(request: FastifyRequest, reply: FastifyReply): string | null {
  const userId = request.authenticatedUser?.id;
  if (!userId) {
    reply.status(401).send({ message: "Se requiere autenticación." });
    return null;
  }
  return userId;
}

export async function registerCalculationRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/calculations",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedQuery = listCalculationsSchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({ message: "Parámetros de consulta no válidos." });
      }

      const { companyId, projectId, clientId } = parsedQuery.data;
      const calculations = await getCompanyCalculationsService(userId, companyId, projectId, clientId);

      return { calculations };
    }
  );

  app.post(
    "/calculations",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = saveCalculationSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del cálculo no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const calculation = await saveCalculationService(userId, parsedBody.data);
      if (!calculation) {
        return reply.status(500).send({ message: "No se pudo guardar el cálculo." });
      }

      return reply.status(201).send({ calculation });
    }
  );

  app.get(
    "/calculations/:calculationId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator", "member", "supervisor", "sales"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = calculationParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({ message: "El cálculo o la empresa no son válidos." });
      }

      const calculation = await getCalculationDetailService(userId, parsedParams.data.calculationId, parsedQuery.data.companyId);
      if (!calculation) {
        return reply.status(404).send({ message: "No se encontró el cálculo." });
      }

      return { calculation };
    }
  );

  app.delete(
    "/calculations/:calculationId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = calculationParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({ message: "El cálculo o la empresa no son válidos." });
      }

      await deleteCalculationService(userId, parsedParams.data.calculationId, parsedQuery.data.companyId);
      return { success: true };
    }
  );
}
