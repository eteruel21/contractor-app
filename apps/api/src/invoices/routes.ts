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

const invoiceParamsSchema = z.object({
  invoiceId: uuidSchema
});

const companyQuerySchema = z.object({
  companyId: uuidSchema
});

const budgetQuerySchema = z.object({
  companyId: uuidSchema,
  budgetId: uuidSchema
});

const createInvoiceSchema = z.object({
  companyId: uuidSchema,
  budgetId: uuidSchema,
  clientId: uuidSchema,

  dueDate: z
    .string()
    .nullable()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(3000)
    .nullable()
    .optional()
});

const invoiceStatusSchema = z.object({
  companyId: uuidSchema,

  status: z.enum([
    "pending",
    "paid",
    "cancelled"
  ])
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

const invoiceDetailsSql = `
  SELECT
    invoice.*,

    CASE
      WHEN customer.id IS NULL
        THEN NULL
      ELSE to_jsonb(customer)
    END AS client,

    CASE
      WHEN budget.id IS NULL
        THEN NULL
      ELSE to_jsonb(budget)
    END AS budget

  FROM public.invoices AS invoice

  LEFT JOIN public.clients AS customer
    ON customer.id =
      invoice.client_id

  LEFT JOIN public.budgets AS budget
    ON budget.id =
      invoice.budget_id
`;

export async function registerInvoiceRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/invoices",
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

      const invoices =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  ${invoiceDetailsSql}
                  WHERE invoice.company_id = $1
                  ORDER BY
                    invoice.created_at DESC
                `,
                [query.data.companyId]
              );

            return result.rows;
          }
        );

      return {
        invoices
      };
    }
  );

  app.get(
    "/invoices/by-budget",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const query =
        budgetQuerySchema.safeParse(
          request.query
        );

      if (!query.success) {
        return reply.status(400).send({
          message:
            "El presupuesto no es válido."
        });
      }

      const invoice =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT *
                  FROM public.invoices
                  WHERE company_id = $1
                    AND budget_id = $2
                  LIMIT 1
                `,
                [
                  query.data.companyId,
                  query.data.budgetId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      return {
        invoice
      };
    }
  );

  app.get(
    "/invoices/:invoiceId",
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
        invoiceParamsSchema.safeParse(
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
            "La factura no es válida."
        });
      }

      const invoice =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  ${invoiceDetailsSql}
                  WHERE invoice.id = $1
                    AND invoice.company_id = $2
                  LIMIT 1
                `,
                [
                  params.data.invoiceId,
                  query.data.companyId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      if (!invoice) {
        return reply.status(404).send({
          message:
            "No se encontró la factura."
        });
      }

      return {
        invoice
      };
    }
  );

  app.post(
    "/invoices",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin", "sales"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const body =
        createInvoiceSchema.safeParse(
          request.body
        );

      if (!body.success) {
        return reply.status(400).send({
          message:
            "Los datos de la factura no son válidos."
        });
      }

      const input = body.data;

      const invoice =
        await withUserTransaction(
          userId,
          async (client) => {
            const createResult =
              await client.query<{
                id: string | null;
              }>(
                `
                  SELECT
                    public.create_invoice(
                      $1,
                      $2,
                      $3,
                      $4::date,
                      $5
                    ) AS id
                `,
                [
                  input.companyId,
                  input.clientId,
                  input.budgetId,
                  input.dueDate ?? null,
                  input.notes ?? null
                ]
              );

            const invoiceId =
              createResult.rows[0]?.id;

            if (!invoiceId) {
              return null;
            }

            const result =
              await client.query(
                `
                  SELECT *
                  FROM public.invoices
                  WHERE id = $1
                  LIMIT 1
                `,
                [invoiceId]
              );

            return result.rows[0] ??
              null;
          }
        );

      if (!invoice) {
        return reply.status(500).send({
          message:
            "No se pudo crear la factura."
        });
      }

      return reply.status(201).send({
        invoice
      });
    }
  );

  app.patch(
    "/invoices/:invoiceId/status",
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
        invoiceParamsSchema.safeParse(
          request.params
        );

      const body =
        invoiceStatusSchema.safeParse(
          request.body
        );

      if (
        !params.success ||
        !body.success
      ) {
        return reply.status(400).send({
          message:
            "El estado de la factura no es válido."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.invoices
              SET
                status =
                  $1::public.invoice_status,
                updated_at = now()
              WHERE id = $2
                AND company_id = $3
            `,
            [
              body.data.status,
              params.data.invoiceId,
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
}