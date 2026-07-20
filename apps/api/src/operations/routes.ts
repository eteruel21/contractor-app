import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { z } from "zod";

import {
  authenticateRequest,
  requireActiveUser,
  requireCompanyRole
} from "../auth/authenticate.js";
import {
  withUserTransaction
} from "../db/with-user-transaction.js";

const uuidSchema = z.string().uuid();

const companyQuerySchema = z.object({
  companyId: uuidSchema
});

const catalogItemParamsSchema = z.object({
  itemId: uuidSchema
});

const categoryParamsSchema = z.object({
  categoryId: uuidSchema
});

const formulaParamsSchema = z.object({
  formulaId: uuidSchema
});

const unitParamsSchema = z.object({
  unitId: uuidSchema
});

const runtimeQuerySchema = z.object({
  companyId: uuidSchema,

  formulaCode: z
    .string()
    .trim()
    .min(1)
    .max(200)
});

const activeSchema = z.object({
  companyId: uuidSchema,
  active: z.boolean()
});

const adminCatalogItemSchema = z.object({
  companyId: uuidSchema,

  itemType: z
    .string()
    .trim()
    .min(1)
    .max(50),

  categoryId:
    uuidSchema.nullable().optional(),

  sku: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(""),

  name: z
    .string()
    .trim()
    .min(2)
    .max(250),

  description: z
    .string()
    .trim()
    .max(3000)
    .optional()
    .default(""),

  unitId: uuidSchema,

  unitCost: z.number().min(0),
  salePrice: z.number().min(0),

  wastePercentage: z
    .number()
    .min(0)
    .max(100)
});

const categorySchema = z.object({
  companyId: uuidSchema,

  name: z
    .string()
    .trim()
    .min(2)
    .max(180),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .default("")
});

const formulaSchema = z.object({
  companyId: uuidSchema,
  catalogItemId: uuidSchema,
  outputUnitId: uuidSchema,

  name: z
    .string()
    .trim()
    .min(2)
    .max(200),

  outputQuantity:
    z.number().positive(),

  laborHours:
    z.number().min(0),

  crewSize:
    z.number().int().positive(),

  wastePercentage:
    z.number().min(0).max(100),

  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default("")
});

const unitSchema = z.object({
  companyId: uuidSchema,

  code: z
    .string()
    .trim()
    .min(1)
    .max(50),

  name: z
    .string()
    .trim()
    .min(2)
    .max(150),

  symbol: z
    .string()
    .trim()
    .min(1)
    .max(30),

  unitType: z
    .string()
    .trim()
    .min(1)
    .max(50),

  conversionFactor:
    z.number().positive()
});

const pricingSchema = z.object({
  companyId: uuidSchema,
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),

  wastePercentage:
    z.number().min(0).max(100),

  source: z
    .string()
    .trim()
    .max(150)
    .optional()
    .default("panel_administrativo"),

  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default("")
});

const pricingAdjustmentSchema = z.object({
  companyId: uuidSchema,

  itemIds: z
    .array(uuidSchema)
    .min(1),

  target: z.enum([
    "unit_cost",
    "sale_price"
  ]),

  percentage: z
    .number()
    .gt(-100),

  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default("")
});

function authenticatedUserId(
  request: FastifyRequest,
  reply: FastifyReply
): string | null {
  const userId =
    request.authenticatedUser?.id;

  if (!userId) {
    reply.status(401).send({
      message:
        "Se requiere autenticación."
    });

    return null;
  }

  return userId;
}

const catalogItemDetailsSql = `
  SELECT
    item.*,

    CASE
      WHEN unit.id IS NULL
        THEN NULL
      ELSE to_jsonb(unit)
    END AS unit,

    CASE
      WHEN category.id IS NULL
        THEN NULL
      ELSE to_jsonb(category)
    END AS category

  FROM public.catalog_items AS item

  LEFT JOIN public.units AS unit
    ON unit.id = item.unit_id

  LEFT JOIN public.catalog_categories
    AS category
    ON category.id = item.category_id
`;

export async function registerOperationRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/admin/catalog/items",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const items =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  ${catalogItemDetailsSql}
                  WHERE item.company_id = $1
                  ORDER BY
                    item.active DESC,
                    item.name ASC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        items
      };
    }
  );

  app.get(
    "/admin/catalog/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        catalogItemParamsSchema.safeParse(
          request.params
        );

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (
        !params.success ||
        !query.success
      ) {
        return reply.status(400).send({
          message:
            "El artículo no es válido."
        });
      }

      const item =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  ${catalogItemDetailsSql}
                  WHERE item.id = $1
                    AND item.company_id = $2
                  LIMIT 1
                `,
                [
                  params.data.itemId,
                  query.data.companyId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      return {
        item
      };
    }
  );

  app.patch(
    "/admin/catalog/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        catalogItemParamsSchema.safeParse(
          request.params
        );

      const body =
        adminCatalogItemSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos del artículo no son válidos."
        });
      }

      const input = body.data;

      const item =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  UPDATE public.catalog_items
                  SET
                    item_type =
                      $1::public.catalog_item_type,
                    category_id = $2,
                    sku = $3,
                    name = $4,
                    description = $5,
                    unit_id = $6,
                    unit_cost = $7,
                    sale_price = $8,
                    waste_percentage = $9,
                    updated_at = now()
                  WHERE id = $10
                    AND company_id = $11
                  RETURNING *
                `,
                [
                  input.itemType,
                  input.categoryId ?? null,
                  input.sku || null,
                  input.name,
                  input.description ||
                    null,
                  input.unitId,
                  input.unitCost,
                  input.salePrice,
                  input.wastePercentage,
                  params.data.itemId,
                  input.companyId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      return {
        item
      };
    }
  );

  app.patch(
    "/admin/catalog/items/:itemId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        catalogItemParamsSchema.safeParse(
          request.params
        );

      const body =
        activeSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
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
              UPDATE public.catalog_items
              SET
                active = $1,
                updated_at = now()
              WHERE id = $2
                AND company_id = $3
            `,
            [
              body.data.active,
              params.data.itemId,
              body.data.companyId
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
    "/admin/catalog/categories",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const categories =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT *
                  FROM public.catalog_categories
                  WHERE company_id = $1
                  ORDER BY
                    active DESC,
                    name ASC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        categories
      };
    }
  );

  app.patch(
    "/admin/catalog/categories/:categoryId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        categoryParamsSchema.safeParse(
          request.params
        );

      const body =
        categorySchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "La categoría no es válida."
        });
      }

      const category =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  UPDATE public.catalog_categories
                  SET
                    name = $1,
                    description = $2,
                    updated_at = now()
                  WHERE id = $3
                    AND company_id = $4
                  RETURNING *
                `,
                [
                  body.data.name,
                  body.data.description ||
                    null,
                  params.data.categoryId,
                  body.data.companyId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      return {
        category
      };
    }
  );

  app.patch(
    "/admin/catalog/categories/:categoryId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        categoryParamsSchema.safeParse(
          request.params
        );

      const body =
        activeSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "La categoría no es válida."
        });
      }

      const result =
        await withUserTransaction(
          userId,
          async (client) => {
            if (!body.data.active) {
              const countResult =
                await client.query<{
                  total: string;
                }>(
                  `
                    SELECT count(*) AS total
                    FROM public.catalog_items
                    WHERE company_id = $1
                      AND category_id = $2
                      AND active = true
                  `,
                  [
                    body.data.companyId,
                    params.data.categoryId
                  ]
                );

              if (
                Number(
                  countResult.rows[0]
                    ?.total ?? 0
                ) > 0
              ) {
                return {
                  blocked: true
                };
              }
            }

            await client.query(
              `
                UPDATE public.catalog_categories
                SET
                  active = $1,
                  updated_at = now()
                WHERE id = $2
                  AND company_id = $3
              `,
              [
                body.data.active,
                params.data.categoryId,
                body.data.companyId
              ]
            );

            return {
              blocked: false
            };
          }
        );

      if (result.blocked) {
        return reply.status(409).send({
          message:
            "Esta categoría contiene elementos activos. Muévelos o desactívalos antes."
        });
      }

      return {
        success: true
      };
    }
  );

  app.get(
    "/admin/formulas",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const formulas =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT *
                  FROM public.catalog_yields
                  WHERE company_id = $1
                  ORDER BY
                    active DESC,
                    name ASC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        formulas
      };
    }
  );

  app.get(
    "/admin/formulas/items",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const items =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT
                    id,
                    name,
                    item_type,
                    active
                  FROM public.catalog_items
                  WHERE company_id = $1
                  ORDER BY
                    active DESC,
                    name ASC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        items
      };
    }
  );

  app.get(
    "/admin/formulas/units",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const units =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT *
                  FROM public.units
                  WHERE company_id = $1
                  ORDER BY
                    active DESC,
                    name ASC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        units
      };
    }
  );

  app.post(
    "/admin/formulas",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const body =
        formulaSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "La fórmula no es válida."
        });
      }

      const input = body.data;

      const formula =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
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
                    notes,
                    active
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
                    $9,
                    true
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

            return result.rows[0] ??
              null;
          }
        );

      return reply.status(201).send({
        formula
      });
    }
  );

  app.patch(
    "/admin/formulas/:formulaId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        formulaParamsSchema.safeParse(
          request.params
        );

      const body =
        formulaSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "La fórmula no es válida."
        });
      }

      const input = body.data;

      const formula =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  UPDATE public.catalog_yields
                  SET
                    catalog_item_id = $1,
                    output_unit_id = $2,
                    name = $3,
                    output_quantity = $4,
                    labor_hours = $5,
                    crew_size = $6,
                    waste_percentage = $7,
                    notes = $8,
                    updated_at = now()
                  WHERE id = $9
                    AND company_id = $10
                  RETURNING *
                `,
                [
                  input.catalogItemId,
                  input.outputUnitId,
                  input.name,
                  input.outputQuantity,
                  input.laborHours,
                  input.crewSize,
                  input.wastePercentage,
                  input.notes || null,
                  params.data.formulaId,
                  input.companyId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      return {
        formula
      };
    }
  );

  app.patch(
    "/admin/formulas/:formulaId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        formulaParamsSchema.safeParse(
          request.params
        );

      const body =
        activeSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "La fórmula no es válida."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.catalog_yields
              SET
                active = $1,
                updated_at = now()
              WHERE id = $2
                AND company_id = $3
            `,
            [
              body.data.active,
              params.data.formulaId,
              body.data.companyId
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
    "/formulas/runtime",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        runtimeQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La fórmula no es válida."
        });
      }

      const normalizedCode =
        query.data.formulaCode
          .trim()
          .toLowerCase()
          .replace(
            /[^a-z0-9_]+/g,
            "_"
          )
          .replace(
            /^_+|_+$/g,
            ""
          );

      const parameters =
        await withUserTransaction(
          userId,
          async (client) => {
            const formulaResult =
              await client.query<{
                id: string;
              }>(
                `
                  SELECT id
                  FROM public.calculation_formulas
                  WHERE company_id = $1
                    AND code = $2
                    AND active = true
                  LIMIT 1
                `,
                [
                  query.data.companyId,
                  normalizedCode
                ]
              );

            const formula =
              formulaResult.rows[0];

            if (!formula) {
              return null;
            }

            const result =
              await client.query<{
                parameter_key: string;
                numeric_value:
                  number | string | null;
              }>(
                `
                  SELECT
                    parameter_key,
                    numeric_value
                  FROM public.calculation_formula_parameters
                  WHERE company_id = $1
                    AND formula_id = $2
                    AND active = true
                `,
                [
                  query.data.companyId,
                  formula.id
                ]
              );

            const output:
              Record<string, number> = {};

            for (
              const row of result.rows
            ) {
              const numericValue =
                Number(
                  row.numeric_value
                );

              if (
                Number.isFinite(
                  numericValue
                )
              ) {
                output[
                  row.parameter_key
                ] = numericValue;
              }
            }

            return output;
          }
        );

      if (!parameters) {
        return reply.status(404).send({
          message:
            "La configuración de cálculo no existe o está inactiva."
        });
      }

      return {
        parameters
      };
    }
  );

  app.get(
    "/measurements/units",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const units =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT *
                  FROM public.units
                  WHERE company_id = $1
                  ORDER BY
                    unit_type ASC,
                    name ASC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        units
      };
    }
  );

  app.post(
    "/measurements/units",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const body =
        unitSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "La unidad no es válida."
        });
      }

      const input = body.data;

      const unit =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  INSERT INTO public.units (
                    company_id,
                    code,
                    name,
                    symbol,
                    unit_type,
                    conversion_factor,
                    active
                  )
                  VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5::public.unit_type,
                    $6,
                    true
                  )
                  RETURNING *
                `,
                [
                  input.companyId,
                  input.code.toLowerCase(),
                  input.name,
                  input.symbol,
                  input.unitType,
                  input.conversionFactor
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      return reply.status(201).send({
        unit
      });
    }
  );

  app.patch(
    "/measurements/units/:unitId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        unitParamsSchema.safeParse(
          request.params
        );

      const body =
        unitSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "La unidad no es válida."
        });
      }

      const input = body.data;

      const unit =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  UPDATE public.units
                  SET
                    code = $1,
                    name = $2,
                    symbol = $3,
                    unit_type =
                      $4::public.unit_type,
                    conversion_factor = $5,
                    updated_at = now()
                  WHERE id = $6
                    AND company_id = $7
                  RETURNING *
                `,
                [
                  input.code.toLowerCase(),
                  input.name,
                  input.symbol,
                  input.unitType,
                  input.conversionFactor,
                  params.data.unitId,
                  input.companyId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      return {
        unit
      };
    }
  );

  app.patch(
    "/measurements/units/:unitId/active",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        unitParamsSchema.safeParse(
          request.params
        );

      const body =
        activeSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "La unidad no es válida."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.units
              SET
                active = $1,
                updated_at = now()
              WHERE id = $2
                AND company_id = $3
            `,
            [
              body.data.active,
              params.data.unitId,
              body.data.companyId
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
    "/pricing/items",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const items =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  ${catalogItemDetailsSql}
                  WHERE item.company_id = $1
                    AND item.active = true
                  ORDER BY item.name ASC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        items
      };
    }
  );

  app.patch(
    "/pricing/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const params =
        catalogItemParamsSchema.safeParse(
          request.params
        );

      const body =
        pricingSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "Los precios no son válidos."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              SELECT
                public.admin_update_catalog_pricing(
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7
                )
            `,
            [
              body.data.companyId,
              params.data.itemId,
              body.data.unitCost,
              body.data.salePrice,
              body.data.wastePercentage,
              body.data.source,
              body.data.notes || null
            ]
          );
        }
      );

      return {
        success: true
      };
    }
  );

  app.post(
    "/pricing/adjust",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const body =
        pricingAdjustmentSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "El ajuste de precios no es válido."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              SELECT
                public.admin_adjust_catalog_prices(
                  $1,
                  $2::uuid[],
                  $3,
                  $4,
                  $5
                )
            `,
            [
              body.data.companyId,
              body.data.itemIds,
              body.data.target,
              body.data.percentage,
              body.data.notes || null
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
    "/pricing/history",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        companyQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "La empresa no es válida."
        });
      }

      const history =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT
                    history.id,
                    history.company_id,
                    history.catalog_item_id,
                    history.unit_cost,
                    history.sale_price,
                    history.previous_unit_cost,
                    history.previous_sale_price,
                    history.effective_at,
                    history.created_at,
                    history.changed_by,

                    COALESCE(
                      profile.full_name,
                      CASE
                        WHEN history.changed_by
                          IS NULL
                          THEN 'Sistema'
                        ELSE 'Usuario'
                      END
                    ) AS changed_by_name,

                    history.source,
                    history.notes,

                    CASE
                      WHEN item.id IS NULL
                        THEN NULL
                      ELSE jsonb_build_object(
                        'id', item.id,
                        'name', item.name,
                        'sku', item.sku,
                        'active', item.active,
                        'unit',
                          CASE
                            WHEN unit.id IS NULL
                              THEN NULL
                            ELSE jsonb_build_object(
                              'name', unit.name,
                              'symbol', unit.symbol
                            )
                          END
                      )
                    END AS item

                  FROM public.catalog_price_history
                    AS history

                  LEFT JOIN public.profiles
                    AS profile
                    ON profile.id =
                      history.changed_by

                  LEFT JOIN public.catalog_items
                    AS item
                    ON item.id =
                      history.catalog_item_id

                  LEFT JOIN public.units AS unit
                    ON unit.id =
                      item.unit_id

                  WHERE history.company_id = $1

                  ORDER BY
                    history.effective_at DESC

                  LIMIT 1000
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        history
      };
    }
  );
}