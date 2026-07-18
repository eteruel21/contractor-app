import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from "zod";

import {
  authenticateRequest
} from "../auth/authenticate.js";
import {
  withUserTransaction
} from "../db/with-user-transaction.js";

const uuidSchema = z.string().uuid();

const itemParamsSchema = z.object({
  itemId: uuidSchema
});

const categoryParamsSchema = z.object({
  categoryId: uuidSchema
});

const yieldParamsSchema = z.object({
  yieldId: uuidSchema
});

const companyQuerySchema = z.object({
  companyId: uuidSchema
});

const yieldQuerySchema = z.object({
  companyId: uuidSchema,
  catalogItemId: uuidSchema
});

const pricingSchema = z.object({
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),
  wastePercentage: z.number().min(0).max(100)
});

const deactivateItemSchema = z.object({
  companyId: uuidSchema
});

const createItemSchema = z.object({
  companyId: uuidSchema,
  itemType: z.string().trim().min(1).max(50),
  categoryId: uuidSchema.nullable().optional(),
  sku: z.string().trim().max(100).optional(),
  name: z.string().trim().min(2).max(250),
  description: z.string().trim().max(3000).optional(),
  unitId: uuidSchema,
  unitCost: z.number().min(0).default(0),
  salePrice: z.number().min(0).default(0),
  wastePercentage: z.number().min(0).max(100).default(0)
});

const createCategorySchema = z.object({
  companyId: uuidSchema,
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000).optional()
});

const deactivateCategorySchema = z.object({
  companyId: uuidSchema
});

const createYieldSchema = z.object({
  companyId: uuidSchema,
  catalogItemId: uuidSchema,
  outputUnitId: uuidSchema,
  name: z.string().trim().min(2).max(200),
  outputQuantity: z.number().positive(),
  laborHours: z.number().min(0),
  crewSize: z.number().int().positive(),
  wastePercentage: z.number().min(0).max(100).default(0),
  notes: z.string().trim().max(2000).optional()
});

const deactivateYieldSchema = z.object({
  companyId: uuidSchema
});

function authenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
): string | null {
  const userId =
    request.authenticatedUser?.id;

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
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const items = await withUserTransaction(
        userId,
        async (client) => {
          const result = await client.query(`
            SELECT *
            FROM public.effective_platform_catalog_prices
            WHERE active = true
            ORDER BY name ASC
          `);

          return result.rows;
        }
      );

      return {
        items
      };
    }
  );

  app.patch(
    "/catalog/items/:itemId/pricing",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        itemParamsSchema.safeParse(request.params);

      const parsedBody =
        pricingSchema.safeParse(request.body);

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "Los precios introducidos no son válidos."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              SELECT public.set_personal_catalog_pricing(
                $1,
                $2,
                $3,
                $4
              )
            `,
            [
              parsedParams.data.itemId,
              parsedBody.data.unitCost,
              parsedBody.data.salePrice,
              parsedBody.data.wastePercentage
            ]
          );
        }
      );

      return {
        success: true
      };
    }
  );

  app.delete(
    "/catalog/items/:itemId/pricing",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        itemParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return reply.status(400).send({
          message:
            "El artículo no es válido."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              SELECT public.reset_personal_catalog_pricing(
                $1
              )
            `,
            [parsedParams.data.itemId]
          );
        }
      );

      return {
        success: true
      };
    }
  );

  app.patch(
    "/catalog/items/:itemId/deactivate",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        itemParamsSchema.safeParse(request.params);

      const parsedBody =
        deactivateItemSchema.safeParse(request.body);

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos del artículo no son válidos."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.catalog_items
              SET
                active = false,
                updated_at = now()
              WHERE id = $1
                AND company_id = $2
            `,
            [
              parsedParams.data.itemId,
              parsedBody.data.companyId
            ]
          );
        }
      );

      return {
        success: true
      };
    }
  );

  app.get(
    "/catalog/units",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedQuery =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!parsedQuery.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const units = await withUserTransaction(
        userId,
        async (client) => {
          const result = await client.query(
            `
              SELECT *
              FROM public.units
              WHERE company_id = $1
                AND active = true
              ORDER BY name ASC
            `,
            [parsedQuery.data.companyId]
          );

          return result.rows;
        }
      );

      return {
        units
      };
    }
  );

  app.get(
    "/catalog/categories",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedQuery =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!parsedQuery.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const categories =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(
              `
                SELECT *
                FROM public.catalog_categories
                WHERE company_id = $1
                  AND active = true
                ORDER BY name ASC
              `,
              [parsedQuery.data.companyId]
            );

            return result.rows;
          }
        );

      return {
        categories
      };
    }
  );

  app.post(
    "/catalog/items",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedBody =
        createItemSchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos del artículo no son válidos.",
          fields:
            parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;

      const item = await withUserTransaction(
        userId,
        async (client) => {
          const result = await client.query(
            `
              INSERT INTO public.catalog_items (
                company_id,
                item_type,
                category_id,
                sku,
                name,
                description,
                unit_id,
                unit_cost,
                sale_price,
                waste_percentage
              )
              VALUES (
                $1,
                $2::public.catalog_item_type,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10
              )
              RETURNING *
            `,
            [
              input.companyId,
              input.itemType,
              input.categoryId ?? null,
              input.sku || null,
              input.name,
              input.description || null,
              input.unitId,
              input.unitCost,
              input.salePrice,
              input.wastePercentage
            ]
          );

          return result.rows[0] ?? null;
        }
      );

      return reply.status(201).send({
        item
      });
    }
  );

  app.post(
    "/catalog/categories",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedBody =
        createCategorySchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos de la categoría no son válidos."
        });
      }

      const input = parsedBody.data;

      const category =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(
              `
                INSERT INTO public.catalog_categories (
                  company_id,
                  name,
                  description
                )
                VALUES (
                  $1,
                  $2,
                  $3
                )
                RETURNING *
              `,
              [
                input.companyId,
                input.name,
                input.description || null
              ]
            );

            return result.rows[0] ?? null;
          }
        );

      return reply.status(201).send({
        category
      });
    }
  );

  app.patch(
    "/catalog/categories/:categoryId/deactivate",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        categoryParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        deactivateCategorySchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "La categoría no es válida."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.catalog_categories
              SET
                active = false,
                updated_at = now()
              WHERE id = $1
                AND company_id = $2
            `,
            [
              parsedParams.data.categoryId,
              parsedBody.data.companyId
            ]
          );
        }
      );

      return {
        success: true
      };
    }
  );

  app.get(
    "/catalog/yields",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedQuery =
        yieldQuerySchema.safeParse(
          request.query
        );

      if (!parsedQuery.success) {
        return reply.status(400).send({
          message:
            "Los datos del rendimiento no son válidos."
        });
      }

      const input = parsedQuery.data;

      const yields = await withUserTransaction(
        userId,
        async (client) => {
          const result = await client.query(
            `
              SELECT
                catalog_yield.*,

                CASE
                  WHEN output_unit.id IS NULL
                    THEN NULL
                  ELSE jsonb_build_object(
                    'id', output_unit.id,
                    'company_id', output_unit.company_id,
                    'code', output_unit.code,
                    'name', output_unit.name,
                    'symbol', output_unit.symbol,
                    'unit_type', output_unit.unit_type,
                    'conversion_factor',
                      output_unit.conversion_factor,
                    'active', output_unit.active,
                    'created_at', output_unit.created_at,
                    'updated_at', output_unit.updated_at
                  )
                END AS output_unit

              FROM public.catalog_yields
                AS catalog_yield

              LEFT JOIN public.units
                AS output_unit
                ON output_unit.id =
                  catalog_yield.output_unit_id

              WHERE catalog_yield.company_id = $1
                AND catalog_yield.catalog_item_id = $2
                AND catalog_yield.active = true

              ORDER BY catalog_yield.name ASC
            `,
            [
              input.companyId,
              input.catalogItemId
            ]
          );

          return result.rows;
        }
      );

      return {
        yields
      };
    }
  );

  app.post(
    "/catalog/yields",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedBody =
        createYieldSchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos del rendimiento no son válidos.",
          fields:
            parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;

      const catalogYield =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(
              `
                INSERT INTO public.catalog_yields (
                  company_id,
                  catalog_item_id,
                  output_unit_id,
                  name,
                  output_quantity,
                  labor_hours,
                  crew_size,
                  waste_percentage,
                  notes
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7,
                  $8,
                  $9
                )
                RETURNING *
              `,
              [
                input.companyId,
                input.catalogItemId,
                input.outputUnitId,
                input.name,
                input.outputQuantity,
                input.laborHours,
                input.crewSize,
                input.wastePercentage,
                input.notes || null
              ]
            );

            return result.rows[0] ?? null;
          }
        );

      return reply.status(201).send({
        yield: catalogYield
      });
    }
  );

  app.patch(
    "/catalog/yields/:yieldId/deactivate",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        yieldParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        deactivateYieldSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "El rendimiento no es válido."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.catalog_yields
              SET
                active = false,
                updated_at = now()
              WHERE id = $1
                AND company_id = $2
            `,
            [
              parsedParams.data.yieldId,
              parsedBody.data.companyId
            ]
          );
        }
      );

      return {
        success: true
      };
    }
  );
}