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

const projectStatusSchema = z.enum([
  "lead",
  "inspection",
  "quoted",
  "approved",
  "in_progress",
  "paused",
  "completed",
  "cancelled"
]);

const projectParamsSchema = z.object({
  projectId: uuidSchema
});

const projectQuerySchema = z.object({
  companyId: uuidSchema,
  clientId: uuidSchema.optional()
});

const companyQuerySchema = z.object({
  companyId: uuidSchema
});

const createProjectSchema = z.object({
  companyId: uuidSchema,
  clientId: uuidSchema,

  addressId:
    uuidSchema.nullable().optional(),

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

  budgetEstimate: z
    .number()
    .min(0)
    .optional()
    .default(0)
});

const statusSchema = z.object({
  companyId: uuidSchema,
  status: projectStatusSchema
});

const progressSchema = z.object({
  companyId: uuidSchema,

  progressPercentage: z
    .number()
    .min(0)
    .max(100)
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

export async function registerProjectRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/projects/client",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const projects =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(`
                SELECT
                  project.*,

                  jsonb_build_object(
                    'name',
                    company.name
                  ) AS company

                FROM public.projects
                  AS project

                JOIN public.clients
                  AS customer
                  ON customer.id =
                    project.client_id

                JOIN public.companies
                  AS company
                  ON company.id =
                    project.company_id

                WHERE customer.user_id =
                  app.current_user_id()

                  AND customer.active = true
                  AND company.active = true

                ORDER BY
                  project.created_at DESC
              `);

            return result.rows;
          }
        );

      return {
        projects
      };
    }
  );

  app.get(
    "/projects",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const parsedQuery =
        projectQuerySchema.safeParse(
          request.query
        );

      if (!parsedQuery.success) {
        return reply.status(400).send({
          message:
            "La empresa o el cliente no son válidos."
        });
      }

      const input = parsedQuery.data;

      const projects =
        await withUserTransaction(
          userId,
          async (client) => {
            if (input.clientId) {
              const result =
                await client.query(
                  `
                    SELECT *
                    FROM public.projects
                    WHERE company_id = $1
                      AND client_id = $2
                    ORDER BY created_at DESC
                  `,
                  [
                    input.companyId,
                    input.clientId
                  ]
                );

              return result.rows;
            }

            const result =
              await client.query(
                `
                  SELECT
                    project.*,

                    CASE
                      WHEN customer.id IS NULL
                        THEN NULL
                      ELSE jsonb_build_object(
                        'id',
                          customer.id,
                        'client_type',
                          customer.client_type,
                        'first_name',
                          customer.first_name,
                        'last_name',
                          customer.last_name,
                        'business_name',
                          customer.business_name
                      )
                    END AS client

                  FROM public.projects
                    AS project

                  LEFT JOIN public.clients
                    AS customer
                    ON customer.id =
                      project.client_id

                  WHERE project.company_id = $1

                  ORDER BY
                    project.created_at DESC
                `,
                [input.companyId]
              );

            return result.rows;
          }
        );

      return {
        projects
      };
    }
  );

  app.post(
    "/projects",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const parsedBody =
        createProjectSchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos del proyecto no son válidos.",

          fields:
            parsedBody.error
              .flatten()
              .fieldErrors
        });
      }

      const input = parsedBody.data;

      const project =
        await withUserTransaction(
          userId,
          async (client) => {
            const sequenceResult =
              await client.query<{
                project_code:
                  string | null;
              }>(
                `
                  SELECT
                    public.next_document_number(
                      $1,
                      'project'
                    ) AS project_code
                `,
                [input.companyId]
              );

            const projectCode =
              sequenceResult.rows[0]
                ?.project_code ?? null;

            const result =
              await client.query(
                `
                  INSERT INTO public.projects (
                    company_id,
                    client_id,
                    address_id,
                    project_code,
                    name,
                    description,
                    status,
                    budget_estimate,
                    created_by
                  )
                  VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    'lead',
                    $7,
                    app.current_user_id()
                  )
                  RETURNING *
                `,
                [
                  input.companyId,
                  input.clientId,
                  input.addressId ?? null,
                  projectCode,
                  input.name,
                  input.description ||
                    null,
                  input.budgetEstimate
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      if (!project) {
        return reply.status(500).send({
          message:
            "No se pudo crear el proyecto."
        });
      }

      return reply.status(201).send({
        project
      });
    }
  );

  app.get(
    "/projects/:projectId",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const parsedParams =
        projectParamsSchema.safeParse(
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
            "El proyecto o la empresa no son válidos."
        });
      }

      const project =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  SELECT
                    project.*,

                    CASE
                      WHEN customer.id IS NULL
                        THEN NULL
                      ELSE to_jsonb(customer)
                    END AS client,

                    CASE
                      WHEN address.id IS NULL
                        THEN NULL
                      ELSE to_jsonb(address)
                    END AS address

                  FROM public.projects
                    AS project

                  LEFT JOIN public.clients
                    AS customer
                    ON customer.id =
                      project.client_id

                  LEFT JOIN public.client_addresses
                    AS address
                    ON address.id =
                      project.address_id

                  WHERE project.id = $1
                    AND project.company_id = $2

                  LIMIT 1
                `,
                [
                  parsedParams.data
                    .projectId,
                  parsedQuery.data
                    .companyId
                ]
              );

            return result.rows[0] ??
              null;
          }
        );

      if (!project) {
        return reply.status(404).send({
          message:
            "No se encontró el proyecto."
        });
      }

      return {
        project
      };
    }
  );

  app.patch(
    "/projects/:projectId/status",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const parsedParams =
        projectParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        statusSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "El estado del proyecto no es válido."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.projects
              SET
                status = $1,
                updated_at = now()
              WHERE id = $2
                AND company_id = $3
            `,
            [
              parsedBody.data.status,
              parsedParams.data.projectId,
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

  app.patch(
    "/projects/:projectId/progress",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(
          request,
          reply
        );

      if (!userId) return;

      const parsedParams =
        projectParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        progressSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "El avance del proyecto no es válido."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.projects
              SET
                progress_percentage = $1,
                updated_at = now()
              WHERE id = $2
                AND company_id = $3
            `,
            [
              parsedBody.data
                .progressPercentage,
              parsedParams.data.projectId,
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