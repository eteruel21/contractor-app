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
  itemParamsSchema,
  categoryParamsSchema,
  yieldParamsSchema,
  companyQuerySchema,
  yieldQuerySchema,
  pricingSchema,
  deactivateItemSchema,
  createItemSchema,
  createCategorySchema,
  deactivateCategorySchema,
  createYieldSchema,
  deactivateYieldSchema
} from "./schemas.js";

import {
  getPlatformCatalogItemsService,
  setPersonalCatalogPricingService,
  resetPersonalCatalogPricingService,
  deactivateCatalogItemService,
  getCatalogUnitsService,
  getCatalogCategoriesService,
  createCatalogItemService,
  createCatalogCategoryService,
  deactivateCatalogCategoryService,
  getCatalogYieldsService,
  createCatalogYieldService,
  deactivateCatalogYieldService
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

export async function registerCatalogRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/catalog/items",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const items = await getPlatformCatalogItemsService(userId);
      return { items };
    }
  );

  app.patch(
    "/catalog/items/:itemId/pricing",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = itemParamsSchema.safeParse(request.params);
      const parsedBody = pricingSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los precios introducidos no son válidos."
        });
      }

      await setPersonalCatalogPricingService(userId, parsedParams.data.itemId, parsedBody.data);
      return { success: true };
    }
  );

  app.delete(
    "/catalog/items/:itemId/pricing",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = itemParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        return reply.status(400).send({
          message: "El artículo no es válido."
        });
      }

      await resetPersonalCatalogPricingService(userId, parsedParams.data.itemId);
      return { success: true };
    }
  );

  app.patch(
    "/catalog/items/:itemId/deactivate",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = itemParamsSchema.safeParse(request.params);
      const parsedBody = deactivateItemSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del artículo no son válidos."
        });
      }

      await deactivateCatalogItemService(userId, parsedParams.data.itemId, parsedBody.data.companyId);
      return { success: true };
    }
  );

  app.get(
    "/catalog/units",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedQuery = companyQuerySchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const units = await getCatalogUnitsService(userId, parsedQuery.data.companyId);
      return { units };
    }
  );

  app.get(
    "/catalog/categories",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedQuery = companyQuerySchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({
          message: "La empresa no es válida."
        });
      }

      const categories = await getCatalogCategoriesService(userId, parsedQuery.data.companyId);
      return { categories };
    }
  );

  app.post(
    "/catalog/items",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createItemSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del artículo no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const item = await createCatalogItemService(userId, parsedBody.data);
      return reply.status(201).send({ item });
    }
  );

  app.post(
    "/catalog/categories",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createCategorySchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos de la categoría no son válidos."
        });
      }

      const category = await createCatalogCategoryService(userId, parsedBody.data);
      return reply.status(201).send({ category });
    }
  );

  app.patch(
    "/catalog/categories/:categoryId/deactivate",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = categoryParamsSchema.safeParse(request.params);
      const parsedBody = deactivateCategorySchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "La categoría no es válida."
        });
      }

      await deactivateCatalogCategoryService(userId, parsedParams.data.categoryId, parsedBody.data.companyId);
      return { success: true };
    }
  );

  app.get(
    "/catalog/yields",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedQuery = yieldQuerySchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({
          message: "Los datos del rendimiento no son válidos."
        });
      }

      const yields = await getCatalogYieldsService(userId, parsedQuery.data.companyId, parsedQuery.data.catalogItemId);
      return { yields };
    }
  );

  app.post(
    "/catalog/yields",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedBody = createYieldSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.status(400).send({
          message: "Los datos del rendimiento no son válidos.",
          fields: parsedBody.error.flatten().fieldErrors
        });
      }

      const catalogYield = await createCatalogYieldService(userId, parsedBody.data);
      return reply.status(201).send({ yield: catalogYield });
    }
  );

  app.patch(
    "/catalog/yields/:yieldId/deactivate",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId = authenticatedUserId(request, reply);
      if (!userId) return;

      const parsedParams = yieldParamsSchema.safeParse(request.params);
      const parsedBody = deactivateYieldSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          message: "El rendimiento no es válido."
        });
      }

      await deactivateCatalogYieldService(userId, parsedParams.data.yieldId, parsedBody.data.companyId);
      return { success: true };
    }
  );
}