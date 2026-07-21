import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const invoiceParamsSchema = z.object({
  invoiceId: uuidSchema
});

export const companyQuerySchema = z.object({
  companyId: uuidSchema
});

export const budgetQuerySchema = z.object({
  companyId: uuidSchema,
  budgetId: uuidSchema
});

export const createInvoiceSchema = z.object({
  companyId: uuidSchema,
  budgetId: uuidSchema,
  clientId: uuidSchema,
  dueDate: z.string().nullable().optional(),
  notes: z.string().trim().max(3000).nullable().optional()
});

export const invoiceStatusSchema = z.object({
  companyId: uuidSchema,
  status: z.enum(["pending", "paid", "cancelled"])
});
