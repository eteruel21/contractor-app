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

const budgetParamsSchema = z.object({
  budgetId: uuidSchema
});

const budgetItemParamsSchema = z.object({
  budgetId: uuidSchema,
  itemId: uuidSchema
});

const listBudgetSchema = z.object({
  companyId: uuidSchema,
  projectId: uuidSchema.optional()
});

const companyQuerySchema = z.object({
  companyId: uuidSchema
});

const createBudgetSchema = z.object({
  companyId: uuidSchema,
  projectId: uuidSchema,

  title: z
    .string()
    .trim()
    .max(250)
    .optional()
    .default("")
});

const budgetItemTypeSchema = z.enum([
  "material",
  "labor",
  "equipment",
  "service",
  "subcontract",
  "manual"
]);

const createBudgetItemSchema = z.object({
  companyId: uuidSchema,

  sectionId:
    uuidSchema.nullable().optional(),

  catalogItemId:
    uuidSchema.nullable().optional(),

  platformCatalogItemId:
    uuidSchema.nullable().optional(),

  itemType:
    budgetItemTypeSchema
      .optional()
      .default("manual"),

  description: z
    .string()
    .trim()
    .min(2)
    .max(1000),

  unitName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default("unidad"),

  quantity: z.number().positive(),
  unitPrice: z.number().min(0),

  unitCost: z
    .number()
    .min(0)
    .optional()
    .default(0),

  discountPercentage: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .default(0),

  taxable: z
    .boolean()
    .optional()
    .default(true),

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
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const budgets =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(`
              SELECT
                budget.*,

                CASE
                  WHEN project.id IS NULL
                    THEN NULL
                  ELSE jsonb_build_object(
                    'name',
                    project.name
                  )
                END AS project,

                CASE
                  WHEN company.id IS NULL
                    THEN NULL
                  ELSE jsonb_build_object(
                    'name',
                    company.name
                  )
                END AS company

              FROM public.budgets AS budget

              JOIN public.clients AS customer
                ON customer.id =
                  budget.client_id

              LEFT JOIN public.projects
                AS project
                ON project.id =
                  budget.project_id

              LEFT JOIN public.companies
                AS company
                ON company.id =
                  budget.company_id

              WHERE customer.user_id =
                app.current_user_id()

              ORDER BY budget.created_at DESC
            `);

            return result.rows;
          }
        );

      return {
        budgets
      };
    }
  );

  app.get(
    "/budgets",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedQuery =
        listBudgetSchema.safeParse(
          request.query
        );

      if (!parsedQuery.success) {
        return reply.status(400).send({
          message:
            "La empresa o el proyecto no son válidos."
        });
      }

      const input = parsedQuery.data;

      const budgets =
        await withUserTransaction(
          userId,
          async (client) => {
            if (input.projectId) {
              const result = await client.query(
                `
                  SELECT *
                  FROM public.budgets
                  WHERE company_id = $1
                    AND project_id = $2
                  ORDER BY created_at DESC
                `,
                [
                  input.companyId,
                  input.projectId
                ]
              );

              return result.rows;
            }

            const result = await client.query(
              `
                SELECT *
                FROM public.budgets
                WHERE company_id = $1
                ORDER BY created_at DESC
              `,
              [input.companyId]
            );

            return result.rows;
          }
        );

      return {
        budgets
      };
    }
  );

  app.post(
    "/budgets/from-project",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedBody =
        createBudgetSchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos del presupuesto no son válidos."
        });
      }

      const input = parsedBody.data;

      const budgetId =
        await withUserTransaction(
          userId,
          async (client) => {
            if (input.title) {
              const result =
                await client.query<{
                  id: string | null;
                }>(
                  `
                    SELECT
                      public.create_project_budget(
                        $1,
                        $2,
                        $3
                      ) AS id
                  `,
                  [
                    input.companyId,
                    input.projectId,
                    input.title
                  ]
                );

              return result.rows[0]?.id ?? null;
            }

            const result =
              await client.query<{
                id: string | null;
              }>(
                `
                  SELECT
                    public.create_project_budget(
                      $1,
                      $2
                    ) AS id
                `,
                [
                  input.companyId,
                  input.projectId
                ]
              );

            return result.rows[0]?.id ?? null;
          }
        );

      if (!budgetId) {
        return reply.status(500).send({
          message:
            "No se pudo crear el presupuesto."
        });
      }

      return reply.status(201).send({
        budgetId
      });
    }
  );

  app.get(
    "/budgets/:budgetId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        budgetParamsSchema.safeParse(
          request.params
        );

      const parsedQuery =
        companyQuerySchema.safeParse(
          request.query
        );

      if (
        !parsedParams.success ||
        !parsedQuery.success
      ) {
        return reply.status(400).send({
          message:
            "El presupuesto o la empresa no son válidos."
        });
      }

      const details =
        await withUserTransaction(
          userId,
          async (client) => {
            const budgetResult =
              await client.query(
                `
                  SELECT *
                  FROM public.budgets
                  WHERE id = $1
                    AND company_id = $2
                  LIMIT 1
                `,
                [
                  parsedParams.data.budgetId,
                  parsedQuery.data.companyId
                ]
              );

            const budget =
              budgetResult.rows[0];

            if (!budget) return null;

            const sectionsResult =
              await client.query(
                `
                  SELECT *
                  FROM public.budget_sections
                  WHERE budget_id = $1
                    AND company_id = $2
                  ORDER BY sort_order ASC
                `,
                [
                  budget.id,
                  budget.company_id
                ]
              );

            const itemsResult =
              await client.query(
                `
                  SELECT *
                  FROM public.budget_items
                  WHERE budget_id = $1
                    AND company_id = $2
                  ORDER BY
                    sort_order ASC,
                    created_at ASC
                `,
                [
                  budget.id,
                  budget.company_id
                ]
              );

            const clientResult =
              await client.query(
                `
                  SELECT *
                  FROM public.clients
                  WHERE id = $1
                    AND company_id = $2
                  LIMIT 1
                `,
                [
                  budget.client_id,
                  budget.company_id
                ]
              );

            const projectResult =
              await client.query(
                `
                  SELECT *
                  FROM public.projects
                  WHERE id = $1
                    AND company_id = $2
                  LIMIT 1
                `,
                [
                  budget.project_id,
                  budget.company_id
                ]
              );

            const project =
              projectResult.rows[0] ?? null;

            let address = null;

            if (project?.address_id) {
              const addressResult =
                await client.query(
                  `
                    SELECT *
                    FROM public.client_addresses
                    WHERE id = $1
                      AND company_id = $2
                    LIMIT 1
                  `,
                  [
                    project.address_id,
                    budget.company_id
                  ]
                );

              address =
                addressResult.rows[0] ??
                null;
            }

            return {
              ...budget,
              sections:
                sectionsResult.rows,
              items:
                itemsResult.rows,
              client:
                clientResult.rows[0] ??
                null,
              project,
              address
            };
          }
        );

      if (!details) {
        return reply.status(404).send({
          message:
            "No se encontró el presupuesto."
        });
      }

      return {
        budget: details
      };
    }
  );

  app.post(
    "/budgets/:budgetId/items",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        budgetParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        createBudgetItemSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos de la partida no son válidos.",
          fields:
            parsedBody.success
              ? undefined
              : parsedBody.error.flatten()
                  .fieldErrors
        });
      }

      const input = parsedBody.data;

      const item =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(
              `
                INSERT INTO public.budget_items (
                  company_id,
                  budget_id,
                  section_id,
                  catalog_item_id,
                  platform_catalog_item_id,
                  item_type,
                  description,
                  unit_name,
                  quantity,
                  unit_cost,
                  unit_price,
                  discount_percentage,
                  taxable,
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
                  $9,
                  $10,
                  $11,
                  $12,
                  $13,
                  $14
                )
                RETURNING *
              `,
              [
                input.companyId,
                parsedParams.data.budgetId,
                input.sectionId ?? null,
                input.catalogItemId ?? null,
                input.platformCatalogItemId ??
                  null,
                input.itemType,
                input.description,
                input.unitName || "unidad",
                input.quantity,
                input.unitCost,
                input.unitPrice,
                input.discountPercentage,
                input.taxable,
                input.notes || null
              ]
            );

            return result.rows[0] ?? null;
          }
        );

      if (!item) {
        return reply.status(500).send({
          message:
            "No se pudo crear la partida."
        });
      }

      return reply.status(201).send({
        item
      });
    }
  );

  app.delete(
    "/budgets/:budgetId/items/:itemId",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "estimator"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        budgetItemParamsSchema.safeParse(
          request.params
        );

      const parsedQuery =
        companyQuerySchema.safeParse(
          request.query
        );

      if (
        !parsedParams.success ||
        !parsedQuery.success
      ) {
        return reply.status(400).send({
          message:
            "La partida no es válida."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              DELETE FROM public.budget_items
              WHERE id = $1
                AND budget_id = $2
                AND company_id = $3
            `,
            [
              parsedParams.data.itemId,
              parsedParams.data.budgetId,
              parsedQuery.data.companyId
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