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
  budgetParamsSchema,
  budgetItemParamsSchema,
  listBudgetSchema,
  companyQuerySchema,
  createBudgetSchema,
  createBudgetItemSchema
} from "./schemas.js";

import {
  getClientBudgetsService,
  getCompanyBudgetsService,
  createProjectBudgetService,
  getBudgetDetailsService,
  addBudgetItemService,
  deleteBudgetItemService
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

export async function registerBudgetRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/budgets/client",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const budgets = await getClientBudgetsService(userId);
      return { budgets };
    }
  );

  app.get(
    "/budgets",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedQuery = listBudgetSchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({
          message: "La empresa o el proyecto no son válidos."
        });
      }

      const input = parsedQuery.data;
      const budgets = await getCompanyBudgetsService(userId, input.companyId, input.projectId);
      return { budgets };
    }
  );

  app.post(
    "/budgets/from-project",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createBudgetSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del presupuesto no son válidos."
        });
      }

      const input = parsedBody.data;
      const budgetId = await createProjectBudgetService(userId, input.companyId, input.projectId, input.title);

      if (!budgetId) {
        return reply.status(500).send({
          message: "No se pudo crear el presupuesto."
        });
      }

      return reply.status(201).send({ budgetId });
    }
  );

  app.get(
    "/budgets/:budgetId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({
          message: "El presupuesto o la empresa no son válidos."
        });
      }

      const details = await getBudgetDetailsService(userId, parsedParams.data.budgetId, parsedQuery.data.companyId);

      if (!details) {
        return reply.status(404).send({
          message: "No se encontró el presupuesto."
        });
      }

      return { budget: details };
    }
  );

  app.post(
    "/budgets/:budgetId/items",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetParamsSchema.safeParse(request.params);
      const parsedBody = createBudgetItemSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la partida no son válidos.",
          fields: parsedBody.success ? undefined : parsedBody.error.flatten().fieldErrors
        });
      }

      const item = await addBudgetItemService(userId, parsedParams.data.budgetId, parsedBody.data);

      if (!item) {
        return reply.status(500).send({
          message: "No se pudo crear la partida."
        });
      }

      return reply.status(201).send({ item });
    }
  );

  app.delete(
    "/budgets/:budgetId/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetItemParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query);

      if (!parsedParams.success || !parsedQuery.success) {
        return reply.status(400).send({
          message: "La partida no es válida."
        });
      }

      await deleteBudgetItemService(
        userId,
        parsedParams.data.budgetId,
        parsedParams.data.itemId,
        parsedQuery.data.companyId
      );

      return { success: true };
    }
  );
}