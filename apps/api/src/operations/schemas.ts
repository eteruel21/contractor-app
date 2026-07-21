import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const companyQuerySchema = z.object({
  companyId: uuidSchema
});

export const catalogItemParamsSchema = z.object({
  itemId: uuidSchema
});

export const categoryParamsSchema = z.object({
  categoryId: uuidSchema
});

export const formulaParamsSchema = z.object({
  formulaId: uuidSchema
});

export const unitParamsSchema = z.object({
  unitId: uuidSchema
});

export const runtimeQuerySchema = z.object({
  companyId: uuidSchema,
  formulaCode: z.string().trim().min(1).max(200)
});

export const activeSchema = z.object({
  companyId: uuidSchema,
  active: z.boolean()
});

export const adminCatalogItemSchema = z.object({
  companyId: uuidSchema,
  itemType: z.string().trim().min(1).max(50),
  categoryId: uuidSchema.nullable().optional(),
  sku: z.string().trim().max(100).optional().default(""),
  name: z.string().trim().min(2).max(250),
  description: z.string().trim().max(3000).optional().default(""),
  unitId: uuidSchema,
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),
  wastePercentage: z.number().min(0).max(100)
});

export const categorySchema = z.object({
  companyId: uuidSchema,
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000).optional().default("")
});

export const formulaSchema = z.object({
  companyId: uuidSchema,
  catalogItemId: uuidSchema,
  outputUnitId: uuidSchema,
  name: z.string().trim().min(2).max(200),
  outputQuantity: z.number().positive(),
  laborHours: z.number().min(0),
  crewSize: z.number().int().positive(),
  wastePercentage: z.number().min(0).max(100),
  notes: z.string().trim().max(2000).optional().default("")
});

export const unitSchema = z.object({
  companyId: uuidSchema,
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(2).max(150),
  symbol: z.string().trim().min(1).max(30),
  unitType: z.string().trim().min(1).max(50),
  conversionFactor: z.number().positive()
});

export const pricingSchema = z.object({
  companyId: uuidSchema,
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),
  wastePercentage: z.number().min(0).max(100),
  source: z.string().trim().max(150).optional().default("panel_administrativo"),
  notes: z.string().trim().max(2000).optional().default("")
});

export const pricingAdjustmentSchema = z.object({
  companyId: uuidSchema,
  itemIds: z.array(uuidSchema).min(1),
  target: z.enum(["unit_cost", "sale_price"]),
  percentage: z.number().gt(-100),
  notes: z.string().trim().max(2000).optional().default("")
});
