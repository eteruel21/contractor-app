import type {
  FastifyInstance
} from "fastify";
import { z } from "zod";

import {
  authenticateRequest
} from "../auth/authenticate.js";
import {
  withUserTransaction
} from "../db/with-user-transaction.js";

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(150),

  phone: z
    .string()
    .trim()
    .max(30)
    .nullable()
});

const updateContractorSchema = z.object({
  businessName: z.string().trim().max(180).nullable(),
  idDocument: z.string().trim().max(100),
  taxId: z.string().trim().max(100).nullable(),
  taxDv: z.string().trim().max(30).nullable(),
  primaryCategory: z.string().trim().max(150).nullable(),

  specialties: z
    .array(z.string().trim().max(150))
    .nullable(),

  experienceYears: z
    .number()
    .int()
    .min(0)
    .max(80)
    .nullable(),

  workAreas: z
    .array(z.string().trim().max(150))
    .nullable(),

  professionalDescription: z
    .string()
    .trim()
    .max(3000)
    .nullable(),

  companyLogoUrl: z.string().trim().max(1000).nullable(),

  portfolioUrls: z
    .array(z.string().trim().max(1000))
    .nullable(),

  certifications: z
    .array(z.string().trim().max(300))
    .nullable(),

  availability: z.string().trim().max(300).nullable(),

  preferredContactMethod: z
    .string()
    .trim()
    .max(100)
    .nullable(),

  emitsInvoice: z.boolean(),
  hasTransport: z.boolean(),

  workMode: z.string().trim().max(150).nullable(),
  docIdUrl: z.string().trim().max(1000).nullable(),

  docOperationNoticeUrl: z
    .string()
    .trim()
    .max(1000)
    .nullable(),

  docTechnicalCertsUrls: z
    .array(z.string().trim().max(1000))
    .nullable(),

  docReferencesUrl: z
    .string()
    .trim()
    .max(1000)
    .nullable(),

  docAddressProofUrl: z
    .string()
    .trim()
    .max(1000)
    .nullable()
});

export async function registerProfileRoutes(
  app: FastifyInstance
): Promise<void> {
  app.patch(
    "/profile",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        request.authenticatedUser?.id;

      if (!userId) {
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      const parsedBody =
        updateProfileSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos del perfil no son válidos.",
          fields:
            parsedBody.error.flatten().fieldErrors
        });
      }

      const { fullName, phone } =
        parsedBody.data;

      const updated = await withUserTransaction(
        userId,
        async (client) => {
          const result = await client.query<{
            id: string;
          }>(
            `
              UPDATE public.profiles
              SET
                full_name = $1,
                phone = $2,
                updated_at = now()
              WHERE id = app.current_user_id()
              RETURNING id
            `,
            [
              fullName,
              phone
            ]
          );

          return result.rows[0] ?? null;
        }
      );

      if (!updated) {
        return reply.status(404).send({
          message: "No se encontró el perfil."
        });
      }

      return {
        success: true
      };
    }
  );

  app.patch(
    "/profile/contractor",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId =
        request.authenticatedUser?.id;

      if (!userId) {
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      const parsedBody =
        updateContractorSchema.safeParse(
          request.body
        );

      if (!parsedBody.success) {
        return reply.status(400).send({
          message:
            "Los datos profesionales no son válidos.",
          fields:
            parsedBody.error.flatten().fieldErrors
        });
      }

      const input = parsedBody.data;

      const updated = await withUserTransaction(
        userId,
        async (client) => {
          const result = await client.query<{
            id: string;
          }>(
            `
              UPDATE public.profiles
              SET
                business_name = $1,
                id_document = $2,
                tax_id = $3,
                tax_dv = $4,
                primary_category = $5,
                specialties = $6,
                experience_years = $7,
                work_areas = $8,
                professional_description = $9,
                company_logo_url = $10,
                portfolio_urls = $11,
                certifications = $12,
                availability = $13,
                preferred_contact_method = $14,
                emits_invoice = $15,
                has_transport = $16,
                work_mode = $17,
                doc_id_url = $18,
                doc_operation_notice_url = $19,
                doc_technical_certs_urls = $20,
                doc_references_url = $21,
                doc_address_proof_url = $22,
                updated_at = now()
              WHERE id = app.current_user_id()
                AND role = 'contractor'
              RETURNING id
            `,
            [
              input.businessName,
              input.idDocument,
              input.taxId,
              input.taxDv,
              input.primaryCategory,
              input.specialties,
              input.experienceYears,
              input.workAreas,
              input.professionalDescription,
              input.companyLogoUrl,
              input.portfolioUrls,
              input.certifications,
              input.availability,
              input.preferredContactMethod,
              input.emitsInvoice,
              input.hasTransport,
              input.workMode,
              input.docIdUrl,
              input.docOperationNoticeUrl,
              input.docTechnicalCertsUrls,
              input.docReferencesUrl,
              input.docAddressProofUrl
            ]
          );

          return result.rows[0] ?? null;
        }
      );

      if (!updated) {
        return reply.status(404).send({
          message:
            "No se encontró un perfil de contratista."
        });
      }

      return {
        success: true
      };
    }
  );
}