import type {
  FastifyInstance
} from "fastify";
import { z } from "zod";

import {
  withUserTransaction
} from "../db/with-user-transaction.js";
import {
  requireSuperAdmin
} from "./authorize.js";

const uuidSchema = z.string().uuid();

const userParamsSchema = z.object({
  userId: uuidSchema
});

const userSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(150),

  phone: z
    .string()
    .trim()
    .max(30),

  role: z.enum([
    "super_admin",
    "contractor",
    "client"
  ]),

  active: z.boolean(),
  approvedAt:
    z.string().nullable(),

  approvedBy:
    uuidSchema.nullable()
});

const categorySchema = z.object({
  id: z
    .string()
    .optional()
    .default(""),

  companyId: uuidSchema,

  name: z
    .string()
    .trim()
    .min(1)
    .max(180),

  description: z
    .string()
    .trim()
    .max(1000),

  active: z.boolean()
});

const itemSchema = z.object({
  id: z
    .string()
    .optional()
    .default(""),

  companyId: uuidSchema,

  sku: z
    .string()
    .trim()
    .max(100),

  name: z
    .string()
    .trim()
    .min(1)
    .max(250),

  description: z
    .string()
    .trim()
    .max(3000),

  itemType: z.enum([
    "material",
    "labor",
    "equipment",
    "service",
    "subcontract"
  ]),

  categoryId:
    uuidSchema.nullable(),

  unitId: uuidSchema,
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),

  wastePercentage:
    z.number().min(0).max(100),

  active: z.boolean()
});

const unitSchema = z.object({
  id: z
    .string()
    .optional()
    .default(""),

  companyId: uuidSchema,

  code: z
    .string()
    .trim()
    .min(1)
    .max(50),

  name: z
    .string()
    .trim()
    .min(1)
    .max(150),

  symbol: z
    .string()
    .trim()
    .min(1)
    .max(30),

  unitType: z.enum([
    "length",
    "area",
    "volume",
    "weight",
    "unit",
    "time",
    "package",
    "service"
  ]),

  conversionFactor:
    z.number().positive(),

  active: z.boolean()
});

const yieldSchema = z.object({
  id: z
    .string()
    .optional()
    .default(""),

  companyId: uuidSchema,
  catalogItemId: uuidSchema,
  outputUnitId: uuidSchema,

  name: z
    .string()
    .trim()
    .min(1)
    .max(200),

  outputQuantity:
    z.number().positive(),

  laborHours:
    z.number().min(0),

  crewSize:
    z.number().positive(),

  wastePercentage:
    z.number().min(0).max(100),

  notes: z
    .string()
    .trim()
    .max(2000),

  active: z.boolean()
});

const formulaParameterSchema = z.object({
  id: z.string().optional(),

  parameterKey: z
    .string()
    .trim()
    .min(1)
    .max(150),

  label: z
    .string()
    .trim()
    .min(1)
    .max(250),

  numericValue:
    z.number().min(0),

  unitLabel: z
    .string()
    .trim()
    .max(100),

  description: z
    .string()
    .trim()
    .max(1000),

  active: z.boolean(),
  sortOrder: z.number().int()
});

const formulaSchema = z.object({
  id: z
    .string()
    .optional()
    .default(""),

  companyId: uuidSchema,

  code: z
    .string()
    .trim()
    .min(1)
    .max(150),

  name: z
    .string()
    .trim()
    .min(1)
    .max(250),

  description: z
    .string()
    .trim()
    .max(2000),

  active: z.boolean(),

  parameters:
    z.array(
      formulaParameterSchema
    )
});

const globalPriceParamsSchema =
  z.object({
    itemId: uuidSchema
  });

const globalPriceSchema = z.object({
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),

  wastePercentage:
    z.number().min(0).max(100)
});

const adjustPricesSchema = z.object({
  itemIds:
    z.array(uuidSchema).min(1),

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
});

function normalizeCode(
  value: string
): string {
  return value
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
}

export async function registerAdminRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/admin/dashboard",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request) => {
      const userId =
        request.authenticatedUser!.id;

      return withUserTransaction(
        userId,
        async (client) => {
          const users =
            await client.query(`
              SELECT
                profile.id,
                COALESCE(
                  profile.full_name,
                  ''
                ) AS full_name,
                COALESCE(
                  profile.phone,
                  ''
                ) AS phone,
                profile.role,
                profile.active,
                profile.approved_at,
                profile.approved_by,
                profile.created_at,

                COALESCE(
                  (
                    SELECT company.name
                    FROM public.company_members
                      AS membership
                    JOIN public.companies
                      AS company
                      ON company.id =
                        membership.company_id
                    WHERE
                      membership.user_id =
                        profile.id
                    ORDER BY
                      membership.active DESC,
                      company.name ASC
                    LIMIT 1
                  ),
                  'Sin empresa'
                ) AS company_name

              FROM public.profiles
                AS profile

              ORDER BY
                profile.active ASC,
                profile.created_at DESC
            `);

          const companies =
            await client.query(`
              SELECT
                id,
                name,
                active
              FROM public.companies
              ORDER BY name ASC
            `);

          const categories =
            await client.query(`
              SELECT
                category.id,
                category.company_id,
                company.name
                  AS company_name,
                category.name,
                COALESCE(
                  category.description,
                  ''
                ) AS description,
                category.active

              FROM public.catalog_categories
                AS category

              LEFT JOIN public.companies
                AS company
                ON company.id =
                  category.company_id

              ORDER BY category.name ASC
            `);

          const items =
            await client.query(`
              SELECT
                item.id,
                item.company_id,
                company.name
                  AS company_name,
                COALESCE(
                  item.sku,
                  ''
                ) AS sku,
                item.name,
                COALESCE(
                  item.description,
                  ''
                ) AS description,
                item.item_type,
                item.category_id,
                COALESCE(
                  category.name,
                  'Sin categoría'
                ) AS category_name,
                item.unit_id,
                COALESCE(
                  unit.symbol,
                  '—'
                ) AS unit_symbol,
                item.unit_cost,
                item.sale_price,
                item.waste_percentage,
                item.active

              FROM public.catalog_items
                AS item

              LEFT JOIN public.companies
                AS company
                ON company.id =
                  item.company_id

              LEFT JOIN public.catalog_categories
                AS category
                ON category.id =
                  item.category_id

              LEFT JOIN public.units AS unit
                ON unit.id =
                  item.unit_id

              ORDER BY item.name ASC
            `);

          const units =
            await client.query(`
              SELECT
                unit.id,
                unit.company_id,
                company.name
                  AS company_name,
                unit.code,
                unit.name,
                unit.symbol,
                unit.unit_type,
                unit.conversion_factor,
                unit.active

              FROM public.units AS unit

              LEFT JOIN public.companies
                AS company
                ON company.id =
                  unit.company_id

              ORDER BY unit.name ASC
            `);

          const yields =
            await client.query(`
              SELECT
                catalog_yield.id,
                catalog_yield.company_id,
                company.name
                  AS company_name,
                catalog_yield.catalog_item_id,
                COALESCE(
                  item.name,
                  'Sin concepto'
                ) AS catalog_item_name,
                catalog_yield.output_unit_id,
                COALESCE(
                  output_unit.symbol,
                  '—'
                ) AS output_unit_symbol,
                catalog_yield.name,
                catalog_yield.output_quantity,
                catalog_yield.labor_hours,
                catalog_yield.crew_size,
                catalog_yield.waste_percentage,
                COALESCE(
                  catalog_yield.notes,
                  ''
                ) AS notes,
                catalog_yield.active

              FROM public.catalog_yields
                AS catalog_yield

              LEFT JOIN public.companies
                AS company
                ON company.id =
                  catalog_yield.company_id

              LEFT JOIN public.catalog_items
                AS item
                ON item.id =
                  catalog_yield.catalog_item_id

              LEFT JOIN public.units
                AS output_unit
                ON output_unit.id =
                  catalog_yield.output_unit_id

              ORDER BY
                catalog_yield.name ASC
            `);

          const formulas =
            await client.query(`
              SELECT
                formula.id,
                formula.company_id,
                company.name
                  AS company_name,
                formula.code,
                formula.name,
                COALESCE(
                  formula.description,
                  ''
                ) AS description,
                formula.active

              FROM public.calculation_formulas
                AS formula

              LEFT JOIN public.companies
                AS company
                ON company.id =
                  formula.company_id

              ORDER BY formula.name ASC
            `);

          const parameters =
            await client.query(`
              SELECT
                id,
                formula_id,
                parameter_key,
                label,
                numeric_value,
                COALESCE(
                  unit_label,
                  ''
                ) AS unit_label,
                COALESCE(
                  description,
                  ''
                ) AS description,
                active,
                sort_order

              FROM public.calculation_formula_parameters

              ORDER BY
                formula_id,
                sort_order ASC
            `);

          const globalItems =
            await client.query(`
              SELECT
                id,
                COALESCE(sku, '') AS sku,
                name,
                COALESCE(
                  description,
                  ''
                ) AS description,
                item_type,
                COALESCE(
                  category_name,
                  'Sin categoría'
                ) AS category_name,
                COALESCE(
                  unit_name,
                  'Unidad'
                ) AS unit_name,
                COALESCE(
                  unit_symbol,
                  'und.'
                ) AS unit_symbol,
                default_unit_cost,
                default_sale_price,
                default_waste_percentage,
                active

              FROM public.platform_catalog_items

              ORDER BY
                item_type ASC,
                name ASC
            `);

          const counts =
            await client.query<{
              project_count: string;
              client_count: string;
              history_count: string;
            }>(`
              SELECT
                (
                  SELECT count(*)
                  FROM public.projects
                ) AS project_count,

                (
                  SELECT count(*)
                  FROM public.clients
                ) AS client_count,

                (
                  SELECT count(*)
                  FROM public.platform_catalog_price_history
                ) AS history_count
            `);

          const parametersByFormula =
            new Map<
              string,
              Array<Record<string, unknown>>
            >();

          for (
            const parameter
            of parameters.rows
          ) {
            const formulaId =
              String(
                parameter.formula_id
              );

            const values =
              parametersByFormula.get(
                formulaId
              ) ?? [];

            values.push({
              id: parameter.id,
              parameterKey:
                parameter.parameter_key,
              label:
                parameter.label,
              numericValue:
                Number(
                  parameter.numeric_value ??
                    0
                ),
              unitLabel:
                parameter.unit_label,
              description:
                parameter.description,
              active:
                Boolean(
                  parameter.active
                ),
              sortOrder:
                Number(
                  parameter.sort_order ??
                    0
                )
            });

            parametersByFormula.set(
              formulaId,
              values
            );
          }

          const countRow =
            counts.rows[0];

          return {
            users:
              users.rows.map(
                (row) => ({
                  id: row.id,
                  fullName:
                    row.full_name,
                  phone: row.phone,
                  role: row.role,
                  active:
                    Boolean(row.active),
                  approvedAt:
                    row.approved_at ??
                    null,
                  approvedBy:
                    row.approved_by ??
                    null,
                  createdAt:
                    row.created_at,
                  companyName:
                    row.company_name
                })
              ),

            companies:
              companies.rows.map(
                (row) => ({
                  id: row.id,
                  name: row.name,
                  active:
                    Boolean(row.active)
                })
              ),

            categories:
              categories.rows.map(
                (row) => ({
                  id: row.id,
                  companyId:
                    row.company_id,
                  companyName:
                    row.company_name ??
                    "Sin empresa",
                  name: row.name,
                  description:
                    row.description,
                  active:
                    Boolean(row.active)
                })
              ),

            items:
              items.rows.map(
                (row) => ({
                  id: row.id,
                  companyId:
                    row.company_id,
                  companyName:
                    row.company_name ??
                    "Sin empresa",
                  sku: row.sku,
                  name: row.name,
                  description:
                    row.description,
                  itemType:
                    row.item_type,
                  categoryId:
                    row.category_id ??
                    null,
                  categoryName:
                    row.category_name,
                  unitId:
                    row.unit_id,
                  unitSymbol:
                    row.unit_symbol,
                  unitCost:
                    Number(
                      row.unit_cost ?? 0
                    ),
                  salePrice:
                    Number(
                      row.sale_price ?? 0
                    ),
                  wastePercentage:
                    Number(
                      row.waste_percentage ??
                        0
                    ),
                  active:
                    Boolean(row.active)
                })
              ),

            globalItems:
              globalItems.rows.map(
                (row) => ({
                  id: row.id,
                  sku: row.sku,
                  name: row.name,
                  description:
                    row.description,
                  itemType:
                    row.item_type,
                  categoryName:
                    row.category_name,
                  unitName:
                    row.unit_name,
                  unitSymbol:
                    row.unit_symbol,
                  unitCost:
                    Number(
                      row.default_unit_cost ??
                        0
                    ),
                  salePrice:
                    Number(
                      row.default_sale_price ??
                        0
                    ),
                  wastePercentage:
                    Number(
                      row.default_waste_percentage ??
                        0
                    ),
                  active:
                    Boolean(row.active)
                })
              ),

            units:
              units.rows.map(
                (row) => ({
                  id: row.id,
                  companyId:
                    row.company_id,
                  companyName:
                    row.company_name ??
                    "Sin empresa",
                  code: row.code,
                  name: row.name,
                  symbol: row.symbol,
                  unitType:
                    row.unit_type,
                  conversionFactor:
                    Number(
                      row.conversion_factor ??
                        1
                    ),
                  active:
                    Boolean(row.active)
                })
              ),

            yields:
              yields.rows.map(
                (row) => ({
                  id: row.id,
                  companyId:
                    row.company_id,
                  companyName:
                    row.company_name ??
                    "Sin empresa",
                  catalogItemId:
                    row.catalog_item_id,
                  catalogItemName:
                    row.catalog_item_name,
                  outputUnitId:
                    row.output_unit_id,
                  outputUnitSymbol:
                    row.output_unit_symbol,
                  name: row.name,
                  outputQuantity:
                    Number(
                      row.output_quantity ??
                        0
                    ),
                  laborHours:
                    Number(
                      row.labor_hours ?? 0
                    ),
                  crewSize:
                    Number(
                      row.crew_size ?? 0
                    ),
                  wastePercentage:
                    Number(
                      row.waste_percentage ??
                        0
                    ),
                  notes: row.notes,
                  active:
                    Boolean(row.active)
                })
              ),

            formulas:
              formulas.rows.map(
                (row) => ({
                  id: row.id,
                  companyId:
                    row.company_id,
                  companyName:
                    row.company_name ??
                    "Sin empresa",
                  code: row.code,
                  name: row.name,
                  description:
                    row.description,
                  active:
                    Boolean(row.active),
                  parameters:
                    parametersByFormula.get(
                      String(row.id)
                    ) ?? []
                })
              ),

            projectCount:
              Number(
                countRow?.project_count ??
                  0
              ),

            clientCount:
              Number(
                countRow?.client_count ??
                  0
              ),

            priceHistoryCount:
              Number(
                countRow?.history_count ??
                  0
              ),

            warnings: []
          };
        }
      );
    }
  );

  app.patch(
    "/admin/users/:userId",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
      const params =
        userParamsSchema.safeParse(
          request.params
        );

      const body =
        userSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos del usuario no son válidos."
        });
      }

      const actorId =
        request.authenticatedUser!.id;

      const input = body.data;

      await withUserTransaction(
        actorId,
        async (client) => {
          await client.query(
            `
              UPDATE public.profiles
              SET
                full_name =
                  NULLIF($1, ''),
                phone =
                  NULLIF($2, ''),

                role =
                  CASE
                    WHEN id = app.current_user_id()
                      THEN role
                    ELSE $3::public.user_role
                  END,

                active =
                  CASE
                    WHEN id = app.current_user_id()
                      THEN active
                    ELSE $4
                  END,

                approved_at =
                  CASE
                    WHEN id = app.current_user_id()
                      THEN approved_at
                    WHEN $4 = true
                      AND approved_at IS NULL
                      THEN now()
                    ELSE approved_at
                  END,

                approved_by =
                  CASE
                    WHEN id = app.current_user_id()
                      THEN approved_by
                    WHEN $4 = true
                      AND approved_at IS NULL
                      THEN app.current_user_id()
                    ELSE approved_by
                  END,

                updated_at = now()

              WHERE id = $5
            `,
            [
              input.fullName,
              input.phone,
              input.role,
              input.active,
              params.data.userId
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
    "/admin/categories/save",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
      const body =
        categorySchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "La categoría no es válida."
        });
      }

      const actorId =
        request.authenticatedUser!.id;

      const input = body.data;

      await withUserTransaction(
        actorId,
        async (client) => {
          if (input.id) {
            await client.query(
              `
                UPDATE public.catalog_categories
                SET
                  name = $1,
                  description =
                    NULLIF($2, ''),
                  active = $3,
                  updated_at = now()
                WHERE id = $4
                  AND company_id = $5
              `,
              [
                input.name,
                input.description,
                input.active,
                input.id,
                input.companyId
              ]
            );

            return;
          }

          await client.query(
            `
              INSERT INTO public.catalog_categories (
                company_id,
                name,
                description,
                active
              )
              VALUES (
                $1,
                $2,
                NULLIF($3, ''),
                $4
              )
            `,
            [
              input.companyId,
              input.name,
              input.description,
              input.active
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
    "/admin/catalog/items/save",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
      const body =
        itemSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "El elemento del catálogo no es válido."
        });
      }

      const actorId =
        request.authenticatedUser!.id;

      const input = body.data;

      await withUserTransaction(
        actorId,
        async (client) => {
          await client.query(
            `
              SELECT public.admin_save_catalog_item(
                requested_item_id => $1,
                requested_company_id => $2,
                requested_sku => $3,
                requested_name => $4,
                requested_description => $5,
                requested_item_type => $6,
                requested_category_id => $7,
                requested_unit_id => $8,
                requested_unit_cost => $9,
                requested_sale_price => $10,
                requested_waste_percentage => $11,
                requested_active => $12
              )
            `,
            [
              input.id || null,
              input.companyId,
              input.sku,
              input.name,
              input.description,
              input.itemType,
              input.categoryId,
              input.unitId,
              input.unitCost,
              input.salePrice,
              input.wastePercentage,
              input.active
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
    "/admin/units/save",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
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

      const actorId =
        request.authenticatedUser!.id;

      const input = body.data;

      await withUserTransaction(
        actorId,
        async (client) => {
          if (input.id) {
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
                  active = $6,
                  updated_at = now()
                WHERE id = $7
                  AND company_id = $8
              `,
              [
                normalizeCode(
                  input.code
                ),
                input.name,
                input.symbol,
                input.unitType,
                input.conversionFactor,
                input.active,
                input.id,
                input.companyId
              ]
            );

            return;
          }

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
                $7
              )
            `,
            [
              input.companyId,
              normalizeCode(input.code),
              input.name,
              input.symbol,
              input.unitType,
              input.conversionFactor,
              input.active
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
    "/admin/yields/save",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
      const body =
        yieldSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "El rendimiento no es válido."
        });
      }

      const actorId =
        request.authenticatedUser!.id;

      const input = body.data;

      await withUserTransaction(
        actorId,
        async (client) => {
          if (input.id) {
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
                  notes =
                    NULLIF($8, ''),
                  active = $9,
                  updated_at = now()
                WHERE id = $10
                  AND company_id = $11
              `,
              [
                input.catalogItemId,
                input.outputUnitId,
                input.name,
                input.outputQuantity,
                input.laborHours,
                input.crewSize,
                input.wastePercentage,
                input.notes,
                input.active,
                input.id,
                input.companyId
              ]
            );

            return;
          }

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
                NULLIF($9, ''),
                $10
              )
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
              input.notes,
              input.active
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
    "/admin/formulas/save",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
      const body =
        formulaSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "La configuración de cálculo no es válida."
        });
      }

      const actorId =
        request.authenticatedUser!.id;

      const input = body.data;

      const parameters =
        input.parameters.map(
          (parameter) => ({
            parameter_key:
              normalizeCode(
                parameter.parameterKey
              ),
            label:
              parameter.label,
            numeric_value:
              parameter.numericValue,
            unit_label:
              parameter.unitLabel ||
              null,
            description:
              parameter.description ||
              null,
            active:
              parameter.active,
            sort_order:
              parameter.sortOrder
          })
        );

      await withUserTransaction(
        actorId,
        async (client) => {
          await client.query(
            `
              SELECT public.admin_save_formula(
                requested_formula_id => $1,
                requested_company_id => $2,
                requested_code => $3,
                requested_name => $4,
                requested_description => $5,
                requested_active => $6,
                requested_parameters =>
                  $7::jsonb
              )
            `,
            [
              input.id || null,
              input.companyId,
              normalizeCode(input.code),
              input.name,
              input.description,
              input.active,
              JSON.stringify(parameters)
            ]
          );
        }
      );

      return {
        success: true
      };
    }
  );

  app.patch(
    "/admin/platform-pricing/:itemId",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
      const params =
        globalPriceParamsSchema.safeParse(
          request.params
        );

      const body =
        globalPriceSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "Los precios globales no son válidos."
        });
      }

      const actorId =
        request.authenticatedUser!.id;

      await withUserTransaction(
        actorId,
        async (client) => {
          await client.query(
            `
              SELECT
                public.admin_update_platform_catalog_pricing(
                  requested_item_id => $1,
                  requested_unit_cost => $2,
                  requested_sale_price => $3,
                  requested_waste_percentage => $4,
                  change_source => $5,
                  change_notes => $6
                )
            `,
            [
              params.data.itemId,
              body.data.unitCost,
              body.data.salePrice,
              body.data.wastePercentage,
              "panel_super_admin",
              "Edición individual del precio maestro"
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
    "/admin/platform-pricing/adjust",
    {
      preHandler:
        requireSuperAdmin
    },
    async (request, reply) => {
      const body =
        adjustPricesSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "El ajuste global no es válido."
        });
      }

      const actorId =
        request.authenticatedUser!.id;

      await withUserTransaction(
        actorId,
        async (client) => {
          await client.query(
            `
              SELECT
                public.admin_adjust_platform_catalog_prices(
                  requested_item_ids =>
                    $1::uuid[],
                  requested_target => $2,
                  requested_percentage => $3,
                  change_notes => $4
                )
            `,
            [
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
}