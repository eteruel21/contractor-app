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

const companyQuerySchema = z.object({
  companyId: uuidSchema
});

const clientParamsSchema = z.object({
  clientId: uuidSchema
});

const clientDetailsSchema = z.object({
  clientId: uuidSchema
});

const addressParamsSchema = z.object({
  clientId: uuidSchema,
  addressId: uuidSchema
});

const clientTypeSchema =
  z.enum(["person", "business"]);

const clientFieldsSchema = z.object({
  companyId: uuidSchema,
  clientType: clientTypeSchema,

  firstName: z
    .string()
    .trim()
    .max(150)
    .optional()
    .default(""),

  lastName: z
    .string()
    .trim()
    .max(150)
    .optional()
    .default(""),

  businessName: z
    .string()
    .trim()
    .max(250)
    .optional()
    .default(""),

  documentType: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(""),

  documentNumber: z
    .string()
    .trim()
    .max(150)
    .optional()
    .default(""),

  email: z
    .string()
    .trim()
    .email()
    .or(z.literal(""))
    .optional()
    .default(""),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),

  secondaryPhone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),

  notes: z
    .string()
    .trim()
    .max(3000)
    .optional()
    .default("")
});

const createClientSchema =
  clientFieldsSchema.extend({
    address: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .default(""),

    addressLabel: z
      .string()
      .trim()
      .max(100)
      .optional()
      .default("Principal"),

    reference: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .default("")
  });

const deactivateClientSchema = z.object({
  companyId: uuidSchema
});

const addressSchema = z.object({
  companyId: uuidSchema,

  label: z
    .string()
    .trim()
    .max(100)
    .default("Dirección"),

  address: z
    .string()
    .trim()
    .min(3)
    .max(1000),

  province: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(""),

  district: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(""),

  township: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(""),

  reference: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .default(""),

  isPrimary: z.boolean().default(false)
});

const addressActionSchema = z.object({
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

function validateClientName(
  input: z.infer<typeof clientFieldsSchema>
): string | null {
  if (
    input.clientType === "person" &&
    `${input.firstName} ${input.lastName}`
      .trim()
      .length < 2
  ) {
    return "Introduce el nombre del cliente.";
  }

  if (
    input.clientType === "business" &&
    input.businessName.trim().length < 2
  ) {
    return "Introduce el nombre de la empresa cliente.";
  }

  return null;
}

const clientDetailsQuery = `
  SELECT
    client.*,

    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(address)
          ORDER BY address.created_at ASC
        )
        FROM public.client_addresses
          AS address
        WHERE address.client_id = client.id
          AND address.company_id =
            client.company_id
      ),
      '[]'::jsonb
    ) AS addresses,

    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(contact)
          ORDER BY contact.created_at ASC
        )
        FROM public.client_contacts
          AS contact
        WHERE contact.client_id = client.id
          AND contact.company_id =
            client.company_id
      ),
      '[]'::jsonb
    ) AS contacts

  FROM public.clients AS client
`;

export async function registerClientRoutes(
  app: FastifyInstance
): Promise<void> {
  app.get(
    "/clients/contractor-companies",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const companies =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(`
              SELECT DISTINCT
                company.id,
                company.name,
                company.phone,
                company.email,
                company.address

              FROM public.clients AS customer

              JOIN public.companies AS company
                ON company.id =
                  customer.company_id

              WHERE customer.user_id =
                app.current_user_id()

                AND customer.active = true
                AND company.active = true

              ORDER BY company.name ASC
            `);

            return result.rows;
          }
        );

      return {
        companies
      };
    }
  );

  app.get(
    "/clients",
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

      const clients =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(
              `
                ${clientDetailsQuery}
                WHERE client.company_id = $1
                  AND client.active = true
                ORDER BY client.created_at DESC
              `,
              [parsedQuery.data.companyId]
            );

            return result.rows;
          }
        );

      return {
        clients
      };
    }
  );

  app.post(
    "/clients",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedBody =
        createClientSchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos del cliente no son válidos.",
          fields:
            parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;
      const nameError =
        validateClientName(input);

      if (nameError) {
        return reply.status(400).send({
          message: nameError
        });
      }

      const createdClient =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  INSERT INTO public.clients (
                    company_id,
                    client_type,
                    first_name,
                    last_name,
                    business_name,
                    document_type,
                    document_number,
                    email,
                    phone,
                    secondary_phone,
                    notes,
                    created_by
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
                    app.current_user_id()
                  )
                  RETURNING *
                `,
                [
                  input.companyId,
                  input.clientType,

                  input.clientType === "person"
                    ? input.firstName || null
                    : null,

                  input.clientType === "person"
                    ? input.lastName || null
                    : null,

                  input.clientType === "business"
                    ? input.businessName
                    : null,

                  input.documentType || null,
                  input.documentNumber || null,

                  input.email
                    ? input.email.toLowerCase()
                    : null,

                  input.phone || null,
                  input.secondaryPhone || null,
                  input.notes || null
                ]
              );

            const customer =
              result.rows[0] ?? null;

            if (
              customer &&
              input.address.length >= 3
            ) {
              await client.query(
                `
                  INSERT INTO public.client_addresses (
                    company_id,
                    client_id,
                    label,
                    address,
                    reference,
                    is_primary
                  )
                  VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    true
                  )
                `,
                [
                  input.companyId,
                  customer.id,
                  input.addressLabel ||
                    "Principal",
                  input.address,
                  input.reference || null
                ]
              );
            }

            return customer;
          }
        );

      if (!createdClient) {
        return reply.status(500).send({
          message:
            "No se pudo crear el cliente."
        });
      }

      return reply.status(201).send({
        client: createdClient
      });
    }
  );

  app.get(
    "/clients/:clientId",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        clientDetailsSchema.safeParse(
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
            "El cliente o la empresa no son válidos."
        });
      }

      const customer =
        await withUserTransaction(
          userId,
          async (client) => {
            const result = await client.query(
              `
                ${clientDetailsQuery}
                WHERE client.company_id = $1
                  AND client.id = $2
                LIMIT 1
              `,
              [
                parsedQuery.data.companyId,
                parsedParams.data.clientId
              ]
            );

            return result.rows[0] ?? null;
          }
        );

      if (!customer) {
        return reply.status(404).send({
          message:
            "No se encontró el cliente."
        });
      }

      return {
        client: customer
      };
    }
  );

  app.patch(
    "/clients/:clientId",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        clientParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        clientFieldsSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos del cliente no son válidos."
        });
      }

      const input = parsedBody.data;
      const nameError =
        validateClientName(input);

      if (nameError) {
        return reply.status(400).send({
          message: nameError
        });
      }

      const customer =
        await withUserTransaction(
          userId,
          async (client) => {
            const result =
              await client.query(
                `
                  UPDATE public.clients
                  SET
                    client_type = $1,
                    first_name = $2,
                    last_name = $3,
                    business_name = $4,
                    document_type = $5,
                    document_number = $6,
                    email = $7,
                    phone = $8,
                    secondary_phone = $9,
                    notes = $10,
                    updated_at = now()
                  WHERE id = $11
                    AND company_id = $12
                  RETURNING *
                `,
                [
                  input.clientType,

                  input.clientType === "person"
                    ? input.firstName || null
                    : null,

                  input.clientType === "person"
                    ? input.lastName || null
                    : null,

                  input.clientType === "business"
                    ? input.businessName
                    : null,

                  input.documentType || null,
                  input.documentNumber || null,

                  input.email
                    ? input.email.toLowerCase()
                    : null,

                  input.phone || null,
                  input.secondaryPhone || null,
                  input.notes || null,

                  parsedParams.data.clientId,
                  input.companyId
                ]
              );

            return result.rows[0] ?? null;
          }
        );

      if (!customer) {
        return reply.status(404).send({
          message:
            "No se encontró el cliente."
        });
      }

      return {
        client: customer
      };
    }
  );

  app.patch(
    "/clients/:clientId/deactivate",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        clientParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        deactivateClientSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "El cliente no es válido."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              UPDATE public.clients
              SET
                active = false,
                updated_at = now()
              WHERE id = $1
                AND company_id = $2
            `,
            [
              parsedParams.data.clientId,
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

  app.post(
    "/clients/:clientId/addresses",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        clientParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        addressSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos de la dirección no son válidos."
        });
      }

      const input = parsedBody.data;

      const address =
        await withUserTransaction(
          userId,
          async (client) => {
            if (input.isPrimary) {
              await client.query(
                `
                  UPDATE public.client_addresses
                  SET
                    is_primary = false,
                    updated_at = now()
                  WHERE company_id = $1
                    AND client_id = $2
                `,
                [
                  input.companyId,
                  parsedParams.data.clientId
                ]
              );
            }

            const result =
              await client.query(
                `
                  INSERT INTO public.client_addresses (
                    company_id,
                    client_id,
                    label,
                    address,
                    province,
                    district,
                    township,
                    reference,
                    is_primary
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
                  parsedParams.data.clientId,
                  input.label || "Dirección",
                  input.address,
                  input.province || null,
                  input.district || null,
                  input.township || null,
                  input.reference || null,
                  input.isPrimary
                ]
              );

            return result.rows[0] ?? null;
          }
        );

      return reply.status(201).send({
        address
      });
    }
  );

  app.patch(
    "/clients/:clientId/addresses/:addressId",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        addressParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        addressSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "Los datos de la dirección no son válidos."
        });
      }

      const input = parsedBody.data;

      const address =
        await withUserTransaction(
          userId,
          async (client) => {
            if (input.isPrimary) {
              await client.query(
                `
                  UPDATE public.client_addresses
                  SET
                    is_primary = false,
                    updated_at = now()
                  WHERE company_id = $1
                    AND client_id = $2
                `,
                [
                  input.companyId,
                  parsedParams.data.clientId
                ]
              );
            }

            const result =
              await client.query(
                `
                  UPDATE public.client_addresses
                  SET
                    label = $1,
                    address = $2,
                    province = $3,
                    district = $4,
                    township = $5,
                    reference = $6,
                    is_primary = $7,
                    updated_at = now()
                  WHERE id = $8
                    AND client_id = $9
                    AND company_id = $10
                  RETURNING *
                `,
                [
                  input.label || "Dirección",
                  input.address,
                  input.province || null,
                  input.district || null,
                  input.township || null,
                  input.reference || null,
                  input.isPrimary,
                  parsedParams.data.addressId,
                  parsedParams.data.clientId,
                  input.companyId
                ]
              );

            return result.rows[0] ?? null;
          }
        );

      if (!address) {
        return reply.status(404).send({
          message:
            "No se encontró la dirección."
        });
      }

      return {
        address
      };
    }
  );

  app.post(
    "/clients/:clientId/addresses/:addressId/primary",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        addressParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        addressActionSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "La dirección no es válida."
        });
      }

      await withUserTransaction(
        userId,
        async (client) => {
          await client.query(
            `
              SELECT public.set_primary_client_address(
                p_company_id => $1,
                p_client_id => $2,
                p_address_id => $3
              )
            `,
            [
              parsedBody.data.companyId,
              parsedParams.data.clientId,
              parsedParams.data.addressId
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
    "/clients/:clientId/addresses/:addressId",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        authenticatedUserId(request, reply);

      if (!userId) return;

      const parsedParams =
        addressParamsSchema.safeParse(
          request.params
        );

      const parsedBody =
        addressActionSchema.safeParse(
          request.body
        );

      if (
        !parsedParams.success ||
        !parsedBody.success
      ) {
        return reply.status(400).send({
          message:
            "La dirección no es válida."
        });
      }

      const input = parsedBody.data;

      const deleted =
        await withUserTransaction(
          userId,
          async (client) => {
            const targetResult =
              await client.query<{
                is_primary: boolean;
              }>(
                `
                  SELECT is_primary
                  FROM public.client_addresses
                  WHERE id = $1
                    AND client_id = $2
                    AND company_id = $3
                  FOR UPDATE
                `,
                [
                  parsedParams.data.addressId,
                  parsedParams.data.clientId,
                  input.companyId
                ]
              );

            const target =
              targetResult.rows[0];

            if (!target) return false;

            await client.query(
              `
                DELETE FROM public.client_addresses
                WHERE id = $1
                  AND client_id = $2
                  AND company_id = $3
              `,
              [
                parsedParams.data.addressId,
                parsedParams.data.clientId,
                input.companyId
              ]
            );

            if (target.is_primary) {
              const replacementResult =
                await client.query<{
                  id: string;
                }>(
                  `
                    SELECT id
                    FROM public.client_addresses
                    WHERE client_id = $1
                      AND company_id = $2
                    ORDER BY created_at ASC
                    LIMIT 1
                  `,
                  [
                    parsedParams.data.clientId,
                    input.companyId
                  ]
                );

              const replacement =
                replacementResult.rows[0];

              if (replacement) {
                await client.query(
                  `
                    SELECT public.set_primary_client_address(
                      p_company_id => $1,
                      p_client_id => $2,
                      p_address_id => $3
                    )
                  `,
                  [
                    input.companyId,
                    parsedParams.data.clientId,
                    replacement.id
                  ]
                );
              }
            }

            return true;
          }
        );

      if (!deleted) {
        return reply.status(404).send({
          message:
            "No se encontró la dirección."
        });
      }

      return {
        success: true
      };
    }
  );
}