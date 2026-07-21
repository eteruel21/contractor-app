import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const itemParamsSchema = z.object({
  itemId: uuidSchema
});

export const categoryParamsSchema = z.object({
  categoryId: uuidSchema
});

export const yieldParamsSchema = z.object({
  yieldId: uuidSchema
});

export const companyQuerySchema = z.object({
  companyId: uuidSchema
});

export const yieldQuerySchema = z.object({
  companyId: uuidSchema,
  catalogItemId: uuidSchema
});

export const pricingSchema = z.object({
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),
  wastePercentage: z.number().min(0).max(100)
});

export const deactivateItemSchema = z.object({
  companyId: uuidSchema
});

export const createItemSchema = z.object({
  companyId: uuidSchema,
  itemType: z.string().trim().min(1).max(50),
  categoryId: uuidSchema.nullable().optional(),
  sku: z.string().trim().max(100).optional(),
  name: z.string().trim().min(2).max(250),
  description: z.string().trim().max(3000).optional(),
  unitId: uuidSchema,
  unitCost: z.number().min(0).default(0),
  salePrice: z.number().min(0).default(0),
  wastePercentage: z.number().min(0).max(100).default(0)
});

export const createCategorySchema = z.object({
  companyId: uuidSchema,
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000).optional()
});

export const deactivateCategorySchema = z.object({
  companyId: uuidSchema
});

export const createYieldSchema = z.object({
  companyId: uuidSchema,
  catalogItemId: uuidSchema,
  outputUnitId: uuidSchema,
  name: z.string().trim().min(2).max(200),
  outputQuantity: z.number().positive(),
  laborHours: z.number().min(0),
  crewSize: z.number().int().positive(),
  wastePercentage: z.number().min(0).max(100).default(0),
  notes: z.string().trim().max(2000).optional()
});

export const deactivateYieldSchema = z.object({
  companyId: uuidSchema
});

export const catalogItemQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  q: z.string().trim().optional(),
  categoryId: uuidSchema.optional(),
  categoryName: z.string().trim().optional()
});

