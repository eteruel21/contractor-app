import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const companyParamsSchema = z.object({
  companyId: uuidSchema
});

export const createCompanySchema = z.object({
  name: z.string().trim().min(2).max(180),
  phone: z.string().trim().max(30).optional().default(""),
  email: z.string().trim().email().or(z.literal("")).optional().default("")
});

export const billingSchema = z.object({
  legalName: z.string().trim().max(250).nullable(),
  taxId: z.string().trim().max(100).nullable(),
  phone: z.string().trim().max(30).nullable(),
  email: z.string().trim().email().nullable().or(z.literal("")),
  address: z.string().trim().max(1000).nullable(),
  logoUrl: z.string().trim().max(1000).nullable(),
  invoicePrefix: z.string().trim().min(1).max(20),
  taxRate: z.number().min(0).max(100)
});
