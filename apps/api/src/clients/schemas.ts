import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const companyQuerySchema = z.object({
  companyId: uuidSchema
});

export const clientParamsSchema = z.object({
  clientId: uuidSchema
});

export const clientDetailsSchema = z.object({
  clientId: uuidSchema
});

export const addressParamsSchema = z.object({
  clientId: uuidSchema,
  addressId: uuidSchema
});

export const clientTypeSchema = z.enum(["person", "business"]);

export const clientFieldsSchema = z.object({
  companyId: uuidSchema,
  clientType: clientTypeSchema,

  firstName: z.string().trim().max(150).optional().default(""),
  lastName: z.string().trim().max(150).optional().default(""),
  businessName: z.string().trim().max(250).optional().default(""),

  documentType: z.string().trim().max(100).optional().default(""),
  documentNumber: z.string().trim().max(150).optional().default(""),

  email: z.string().trim().email().or(z.literal("")).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  secondaryPhone: z.string().trim().max(30).optional().default(""),
  notes: z.string().trim().max(3000).optional().default("")
});

export const createClientSchema = clientFieldsSchema.extend({
  address: z.string().trim().max(1000).optional().default(""),
  addressLabel: z.string().trim().max(100).optional().default("Principal"),
  reference: z.string().trim().max(1000).optional().default("")
});

export const deactivateClientSchema = z.object({
  companyId: uuidSchema
});

export const addressSchema = z.object({
  companyId: uuidSchema,
  label: z.string().trim().max(100).default("Dirección"),
  address: z.string().trim().min(3).max(1000),
  province: z.string().trim().max(100).optional().default(""),
  district: z.string().trim().max(100).optional().default(""),
  township: z.string().trim().max(100).optional().default(""),
  reference: z.string().trim().max(1000).optional().default(""),
  isPrimary: z.boolean().default(false)
});

export const addressActionSchema = z.object({
  companyId: uuidSchema
});

export function validateClientName(
  input: z.infer<typeof clientFieldsSchema>
): string | null {
  if (
    input.clientType === "person" &&
    `${input.firstName} ${input.lastName}`.trim().length < 2
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
