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
  createBudgetItemSchema,
  approveBudgetSchema,
  rejectBudgetSchema,
  convertCalculationSchema
} from "./schemas.js";

import {
  getClientBudgetsService,
  getClientBudgetDetailService,
  getCompanyBudgetsService,
  createProjectBudgetService,
  getBudgetDetailsService,
  addBudgetItemService,
  deleteBudgetItemService,
  approveBudgetService,
  rejectBudgetService,
  getBudgetHistoryService
} from "./services.js";

import { getCalculationDetailService } from "../calculations/services.js";

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
    "/budgets/client/:budgetId",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({
          message: "Identificador de presupuesto no válido."
        });
      }

      const budget = await getClientBudgetDetailService(userId, parsedParams.data.budgetId);
      if (!budget) {
        return reply.status(404).send({
          message: "No se encontró el presupuesto."
        });
      }

      return { budget };
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

      try {
        const item = await addBudgetItemService(userId, parsedParams.data.budgetId, parsedBody.data);
        if (!item) {
          return reply.status(500).send({ message: "No se pudo crear la partida." });
        }
        return reply.status(201).send({ item });
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || "Error al añadir la partida." });
      }
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

      try {
        await deleteBudgetItemService(
          userId,
          parsedParams.data.budgetId,
          parsedParams.data.itemId,
          parsedQuery.data.companyId
        );
        return { success: true };
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || "Error al eliminar la partida." });
      }
    }
  );

  app.post(
    "/budgets/:budgetId/approve",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetParamsSchema.safeParse(request.params);
      const parsedBody = approveBudgetSchema.safeParse(request.body || {});

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({ message: "Datos no válidos para la aprobación." });
      }

      try {
        const budget = await approveBudgetService(userId, parsedParams.data.budgetId, parsedBody.data.companyId);
        return { budget };
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || "Error al aprobar el presupuesto." });
      }
    }
  );

  app.post(
    "/budgets/:budgetId/reject",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetParamsSchema.safeParse(request.params);
      const parsedBody = rejectBudgetSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Motivo de rechazo o identificador no válido.",
          fields: parsedBody.success ? undefined : parsedBody.error.flatten().fieldErrors
        });
      }

      try {
        const budget = await rejectBudgetService(
          userId,
          parsedParams.data.budgetId,
          parsedBody.data.rejectionReason,
          parsedBody.data.companyId
        );
        return { budget };
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || "Error al rechazar el presupuesto." });
      }
    }
  );

  app.get(
    "/budgets/:budgetId/history",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetParamsSchema.safeParse(request.params);
      const parsedQuery = companyQuerySchema.safeParse(request.query || {});

      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Identificador de presupuesto no válido." });
      }

      const history = await getBudgetHistoryService(userId, parsedParams.data.budgetId, parsedQuery.data?.companyId);
      return { history };
    }
  );

  app.post(
    "/budgets/:budgetId/items/from-calculation",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = budgetParamsSchema.safeParse(request.params);
      const parsedBody = convertCalculationSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Datos de conversión de cálculo no válidos.",
          fields: parsedBody.success ? undefined : parsedBody.error.flatten().fieldErrors
        });
      }

      const { companyId, calculationId, sectionId, items } = parsedBody.data;

      let itemsToInsert = items || [];

      if (calculationId) {
        const savedCalc = await getCalculationDetailService(userId, calculationId, companyId);
        if (!savedCalc) {
          return reply.status(404).send({ message: "No se encontró el cálculo guardado." });
        }

        const lineItems = savedCalc.results_data?.lineItems || [];
        if (lineItems.length > 0) {
          itemsToInsert = lineItems.map((li: any) => ({
            sectionId: sectionId ?? null,
            catalogItemId: null,
            platformCatalogItemId: null,
            itemType: li.itemType || "manual",
            description: li.description || "Partida de cálculo",
            unitName: li.unitName || "unidad",
            quantity: Number(li.quantity) || 1,
            unitCost: Number(li.unitCost) || 0,
            unitPrice: Number(li.unitPrice) || 0,
            discountPercentage: 0,
            taxable: true,
            notes: `Generado desde cálculo: ${savedCalc.title}`
          }));
        }
      }

      if (itemsToInsert.length === 0) {
        return reply.status(400).send({ message: "No hay partidas para convertir o insertar." });
      }

      const createdItems = [];
      for (const itemInput of itemsToInsert) {
        const item = await addBudgetItemService(userId, parsedParams.data.budgetId, {
          companyId,
          ...itemInput
        });
        if (item) createdItems.push(item);
      }

      return reply.status(201).send({ items: createdItems });
    }
  );
}