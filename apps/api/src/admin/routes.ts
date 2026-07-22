import type { FastifyInstance } from "fastify";
import { requireSuperAdmin } from "./authorize.js";
import {
  userParamsSchema,
  userSchema,
  categorySchema,
  itemSchema,
  unitSchema,
  yieldSchema,
  formulaSchema,
  globalPriceParamsSchema,
  globalPriceSchema,
  adjustPricesSchema
} from "./schemas.js";
import {
  getAdminDashboardService,
  updateAdminUserService,
  saveCategoryService,
  saveItemService,
  saveUnitService,
  saveYieldService,
  saveFormulaService,
  saveGlobalPriceService,
  adjustPricesService
} from "./services.js";

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  // 1. Dashboard principal
  app.get(
    "/admin/dashboard",
    {
      preHandler: requireSuperAdmin
    },
    async (request) => {
      const userId = request.authenticatedUser!.id;
      return getAdminDashboardService(userId);
    }
  );

  // 2. Usuarios
  app.patch(
    "/admin/users/:userId",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const params = userParamsSchema.safeParse(request.params);
      const body = userSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos del usuario no son válidos."
        });
      }

      const updated = await updateAdminUserService(userId, params.data.userId, body.data);

      if (!updated) {
        return reply.status(404).send({
          message: "No se encontró el usuario."
        });
      }

      return { success: true };
    }
  );

  // 3. Categorías
  app.post(
    "/admin/categories/save",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const body = categorySchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          message: "Los datos de la categoría no son válidos."
        });
      }

      const result = await saveCategoryService(userId, body.data);
      return { success: true, category: result };
    }
  );

  // 4. Ítems de Catálogo
  app.post(
    "/admin/catalog/items/save",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const body = itemSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          message: "Los datos del concepto de catálogo no son válidos."
        });
      }

      const result = await saveItemService(userId, body.data);
      return { success: true, item: result };
    }
  );

  // 5. Unidades
  app.post(
    "/admin/units/save",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const body = unitSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          message: "Los datos de la unidad no son válidos."
        });
      }

      const result = await saveUnitService(userId, body.data);
      return { success: true, unit: result };
    }
  );

  // 6. Rendimientos
  app.post(
    "/admin/yields/save",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const body = yieldSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          message: "Los datos del rendimiento no son válidos."
        });
      }

      const result = await saveYieldService(userId, body.data);
      return { success: true, yield: result };
    }
  );

  // 7. Fórmulas
  app.post(
    "/admin/formulas/save",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const body = formulaSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          message: "Los datos de la fórmula no son válidos."
        });
      }

      const result = await saveFormulaService(userId, body.data);
      return { success: true, formula: result };
    }
  );

  // 8. Precios Globales (Edición individual)
  app.patch(
    "/admin/platform-pricing/:itemId",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const params = globalPriceParamsSchema.safeParse(request.params);
      const body = globalPriceSchema.safeParse(request.body);

      if (!params.success || !body.success) {
        return reply.status(400).send({
          message: "Los datos de precios globales no son válidos."
        });
      }

      const updated = await saveGlobalPriceService(userId, params.data.itemId, body.data);

      if (!updated) {
        return reply.status(404).send({
          message: "No se encontró el ítem del catálogo global."
        });
      }

      return { success: true };
    }
  );

  // 9. Precios Globales (Ajuste porcentual masivo)
  app.post(
    "/admin/platform-pricing/adjust",
    {
      preHandler: requireSuperAdmin
    },
    async (request, reply) => {
      const userId = request.authenticatedUser!.id;
      const body = adjustPricesSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          message: "Los datos del ajuste de precios no son válidos."
        });
      }

      const adjustedCount = await adjustPricesService(userId, body.data);
      return { success: true, adjustedCount };
    }
  );
}