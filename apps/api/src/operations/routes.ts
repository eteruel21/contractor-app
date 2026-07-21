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
  companyQuerySchema,
  catalogItemParamsSchema,
  categoryParamsSchema,
  formulaParamsSchema,
  unitParamsSchema,
  runtimeQuerySchema,
  activeSchema,
  adminCatalogItemSchema,
  categorySchema,
  formulaSchema,
  unitSchema,
  pricingSchema,
  pricingAdjustmentSchema
} from "./schemas.js";

import {
  getAdminCatalogItemsService,
  getAdminCatalogItemByIdService,
  updateAdminCatalogItemService,
  setCatalogItemActiveService,
  getAdminCategoriesService,
  updateAdminCategoryService,
  setCategoryActiveService,
  getAdminFormulasService,
  getFormulaItemsService,
  getFormulaUnitsService,
  createAdminFormulaService,
  updateAdminFormulaService,
  setFormulaActiveService,
  getRuntimeFormulaParametersService,
  getMeasurementUnitsService,
  createMeasurementUnitService,
  updateMeasurementUnitService,
  setMeasurementUnitActiveService,
  getPricingItemsService,
  updateItemPricingService,
  adjustPricingService,
  getPricingHistoryService
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

export async function registerOperationRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/admin/catalog/items",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const items = await getAdminCatalogItemsService(userId, query.data.companyId);
      return { items };
    }
  );

  app.get(
    "/admin/catalog/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = catalogItemParamsSchema.safeParse(request.params);
      const query = companyQuerySchema.safeParse(request.query);

      if (!params.success || !query.success) {
        return reply.status(400).send({
          message: "El artículo no es válido."
        });
      }

      const item = await getAdminCatalogItemByIdService(userId, params.data.itemId, query.data.companyId);
      return { item };
    }
  );

  app.patch(
    "/admin/catalog/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = catalogItemParamsSchema.safeParse(request.params);
      const body = adminCatalogItemSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos del artículo no son válidos."
        });
      }

      const item = await updateAdminCatalogItemService(userId, params.data.itemId, body.data);
      return { item };
    }
  );

  app.patch(
    "/admin/catalog/items/:itemId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = catalogItemParamsSchema.safeParse(request.params);
      const body = activeSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "El artículo no es válido."
        });
      }

      await setCatalogItemActiveService(userId, params.data.itemId, body.data.companyId, body.data.active);
      return { success: true };
    }
  );

  app.get(
    "/admin/catalog/categories",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const categories = await getAdminCategoriesService(userId, query.data.companyId);
      return { categories };
    }
  );

  app.patch(
    "/admin/catalog/categories/:categoryId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = categoryParamsSchema.safeParse(request.params);
      const body = categorySchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "La categoría no es válida."
        });
      }

      const category = await updateAdminCategoryService(userId, params.data.categoryId, body.data);
      return { category };
    }
  );

  app.patch(
    "/admin/catalog/categories/:categoryId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = categoryParamsSchema.safeParse(request.params);
      const body = activeSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "La categoría no es válida."
        });
      }

      const result = await setCategoryActiveService(
        userId,
        params.data.categoryId,
        body.data.companyId,
        body.data.active
      );

      if (result.blocked) {
        return reply.status(409).send({
          message: "Esta categoría contiene elementos activos. Muévelos o desactívalos antes."
        });
      }

      return { success: true };
    }
  );

  app.get(
    "/admin/formulas",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const formulas = await getAdminFormulasService(userId, query.data.companyId);
      return { formulas };
    }
  );

  app.get(
    "/admin/formulas/items",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const items = await getFormulaItemsService(userId, query.data.companyId);
      return { items };
    }
  );

  app.get(
    "/admin/formulas/units",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const units = await getFormulaUnitsService(userId, query.data.companyId);
      return { units };
    }
  );

  app.post(
    "/admin/formulas",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const body = formulaSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          message: "La fórmula no es válida."
        });
      }

      const formula = await createAdminFormulaService(userId, body.data);
      return reply.status(201).send({ formula });
    }
  );

  app.patch(
    "/admin/formulas/:formulaId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = formulaParamsSchema.safeParse(request.params);
      const body = formulaSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "La fórmula no es válida."
        });
      }

      const formula = await updateAdminFormulaService(userId, params.data.formulaId, body.data);
      return { formula };
    }
  );

  app.patch(
    "/admin/formulas/:formulaId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = formulaParamsSchema.safeParse(request.params);
      const body = activeSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "La fórmula no es válida."
        });
      }

      await setFormulaActiveService(userId, params.data.formulaId, body.data.companyId, body.data.active);
      return { success: true };
    }
  );

  app.get(
    "/formulas/runtime",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = runtimeQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La fórmula no es válida."
        });
      }

      const parameters = await getRuntimeFormulaParametersService(userId, query.data.companyId, query.data.formulaCode);

      if (!parameters) {
        return reply.status(404).send({
          message: "La configuración de cálculo no existe o está inactiva."
        });
      }

      return { parameters };
    }
  );

  app.get(
    "/measurements/units",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const units = await getMeasurementUnitsService(userId, query.data.companyId);
      return { units };
    }
  );

  app.post(
    "/measurements/units",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const body = unitSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          message: "La unidad no es válida."
        });
      }

      const unit = await createMeasurementUnitService(userId, body.data);
      return reply.status(201).send({ unit });
    }
  );

  app.patch(
    "/measurements/units/:unitId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = unitParamsSchema.safeParse(request.params);
      const body = unitSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "La unidad no es válida."
        });
      }

      const unit = await updateMeasurementUnitService(userId, params.data.unitId, body.data);
      return { unit };
    }
  );

  app.patch(
    "/measurements/units/:unitId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = unitParamsSchema.safeParse(request.params);
      const body = activeSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "La unidad no es válida."
        });
      }

      await setMeasurementUnitActiveService(userId, params.data.unitId, body.data.companyId, body.data.active);
      return { success: true };
    }
  );

  app.get(
    "/pricing/items",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const items = await getPricingItemsService(userId, query.data.companyId);
      return { items };
    }
  );

  app.patch(
    "/pricing/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const params = catalogItemParamsSchema.safeParse(request.params);
      const body = pricingSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los precios no son válidos."
        });
      }

      await updateItemPricingService(userId, params.data.itemId, body.data);
      return { success: true };
    }
  );

  app.post(
    "/pricing/adjust",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const body = pricingAdjustmentSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          message: "El ajuste de precios no es válido."
        });
      }

      await adjustPricingService(userId, body.data);
      return { success: true };
    }
  );

  app.get(
    "/pricing/history",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const query = companyQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const history = await getPricingHistoryService(userId, query.data.companyId);
      return { history };
    }
  );
}