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

const companyParamsSchema = z.object({
  companyId: uuidSchema
});

const createCompanySchema = z.object({
  name: z.string().trim().min(2).max(180),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),

  email: z
    .string()
    .trim()
    .email()
    .or(z.literal(""))
    .optional()
    .default("")
});

const billingSchema = z.object({
  legalName: z.string().trim().max(250).nullable(),
  taxId: z.string().trim().max(100).nullable(),
  phone: z.string().trim().max(30).nullable(),

  email: z
    .string()
    .trim()
    .email()
    .nullable()
    .or(z.literal("")),

  address: z.string().trim().max(1000).nullable(),
  logoUrl: z.string().trim().max(1000).nullable(),

  invoicePrefix: z
    .string()
    .trim()
    .min(1)
    .max(20),

  taxRate: z.number().min(0).max(100)
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

export async function registerCompanyRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/companies",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const memberships =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(`
              SELECT
                membership.id,
                membership.company_id,
                membership.user_id,
                membership.role,
                membership.active,

                jsonb_build_object(
                  'id', company.id,
                  'name', company.name,
                  'legal_name', company.legal_name,
                  'tax_id', company.tax_id,
                  'phone', company.phone,
                  'email', company.email,
                  'address', company.address,
                  'logo_url', company.logo_url,
                  'currency_code',
                    company.currency_code,
                  'tax_rate', company.tax_rate,
                  'timezone', company.timezone,
                  'quotation_prefix',
                    company.quotation_prefix,
                  'invoice_prefix',
                    company.invoice_prefix,
                  'receipt_prefix',
                    company.receipt_prefix,
                  'project_prefix',
                    company.project_prefix,
                  'payment_prefix',
                    company.payment_prefix,
                  'created_by',
                    company.created_by,
                  'active', company.active,
                  'created_at',
                    company.created_at,
                  'updated_at',
                    company.updated_at
                ) AS company

              FROM public.company_members
                AS membership

              JOIN public.companies AS company
                ON company.id =
                  membership.company_id

              WHERE membership.user_id =
                app.current_user_id()

                AND membership.active = true
                AND company.active = true

              ORDER BY membership.created_at ASC
            `);

            return result.rows;
          }
        );

      return {
        memberships
      };
    }
  );

  app.post(
    "/companies",
    {
      preHandler: [authenticateRequest, requireActiveUser]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedBody =
        createCompanySchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos de la empresa no son válidos.",
          fields:
            parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;

      const companyId =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query<{
                id: string;
              }>(
                `
                  SELECT public.create_company(
                    company_name => $1,
                    company_phone => $2,
                    company_email => $3
                  ) AS id
                `,
                [
                  input.name,
                  input.phone || null,
                  input.email
                    ? input.email.toLowerCase()
                    : null
                ]
              );

            return result.rows[0]?.id ?? null;
          }
        );

      if (!companyId) {
        return reply.status(500).send({
          message:
            "No se pudo crear la empresa."
        });
      }

      return reply.status(201).send({
        companyId
      });
    }
  );

  app.patch(
    "/companies/:companyId/billing",
    {
      preHandler: [authenticateRequest, requireActiveUser, requireCompanyRole(["owner", "admin"])]
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        companyParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        billingSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos de facturación no son válidos."
        });
      }

      const input = parsedBody.data;

      const company =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query<{
                id: string;
              }>(
                `
                  UPDATE public.companies
                  SET
                    legal_name = $1,
                    tax_id = $2,
                    phone = $3,
                    email = $4,
                    address = $5,
                    logo_url = $6,
                    invoice_prefix = $7,
                    tax_rate = $8,
                    updated_at = now()
                  WHERE id = $9
                    AND EXISTS (
                      SELECT 1
                      FROM public.company_members
                        AS membership
                      WHERE
                        membership.company_id =
                          public.companies.id
                        AND membership.user_id =
                          app.current_user_id()
                        AND membership.active = true
                        AND membership.role IN (
                          'owner',
                          'admin'
                        )
                    )
                  RETURNING id
                `,
                [
                  input.legalName || null,
                  input.taxId || null,
                  input.phone || null,
                  input.email
                    ? input.email.toLowerCase()
                    : null,
                  input.address || null,
                  input.logoUrl || null,
                  input.invoicePrefix || "FAC",
                  input.taxRate,
                  parsedParams.data.companyId
                ]
              );

            return result.rows[0] ?? null;
          }
        );

      if (!company) {
        return reply.status(404).send({
          message:
            "No se encontró la empresa o no tienes permiso para editarla."
        });
      }

      return {
        success: true
      };
    }
  );
}