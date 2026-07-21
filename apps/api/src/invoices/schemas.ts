import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const invoiceParamsSchema = z.object({
  invoiceId: uuidSchema
});

export const invoicePaymentParamsSchema = z.object({
  invoiceId: uuidSchema,
  paymentId: uuidSchema
});

export const invoiceCreditNoteParamsSchema = z.object({
  invoiceId: uuidSchema,
  creditNoteId: uuidSchema
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

export const invoiceActionSchema = z.object({
  companyId: uuidSchema
});

export const invoicePaymentMethodSchema = z.enum([
  "cash",
  "bank_transfer",
  "card",
  "check",
  "other"
]);

export const createInvoicePaymentSchema = z.object({
  companyId: uuidSchema,
  amount: z.number()
    .finite()
    .positive()
    .max(9_999_999_999.99)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8,
      "El monto admite como máximo dos decimales."
    ),
  method: invoicePaymentMethodSchema,
  paidAt: z.string().datetime({ offset: true }).nullable().optional(),
  reference: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
});

export const reverseInvoicePaymentSchema = z.object({
  companyId: uuidSchema,
  reason: z.string().trim().min(3).max(1000)
});

export const cancelInvoiceSchema = z.object({
  companyId: uuidSchema,
  reason: z.string().trim().min(3).max(1000)
});

export const createInvoiceCreditNoteSchema = z.object({
  companyId: uuidSchema,
  amount: z.number()
    .finite()
    .positive()
    .max(9_999_999_999.99)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8,
      "El monto admite como máximo dos decimales."
    ),
  reason: z.string().trim().min(3).max(1000)
});

export const cancelInvoiceCreditNoteSchema = cancelInvoiceSchema;

export const invoiceStatusSchema = z.object({
  companyId: uuidSchema,
  status: z.literal("overdue"),
  reason: z.string().trim().min(3).max(1000).nullable().optional()
});
