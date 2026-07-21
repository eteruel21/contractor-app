import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const budgetParamsSchema = z.object({
  budgetId: uuidSchema
});

export const budgetItemParamsSchema = z.object({
  budgetId: uuidSchema,
  itemId: uuidSchema
});

export const listBudgetSchema = z.object({
  companyId: uuidSchema,
  projectId: uuidSchema.optional()
});

export const companyQuerySchema = z.object({
  companyId: uuidSchema
});

export const createBudgetSchema = z.object({
  companyId: uuidSchema,
  projectId: uuidSchema,

  title: z
    .string()
    .trim()
    .max(250)
    .optional()
    .default("")
});

export const budgetItemTypeSchema = z.enum([
  "material",
  "labor",
  "equipment",
  "service",
  "subcontract",
  "manual"
]);

export const createBudgetItemSchema = z.object({
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
