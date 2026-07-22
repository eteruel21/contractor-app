import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const userParamsSchema = z.object({
  userId: uuidSchema
});

export const userSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().trim().max(150),
  phone: z.string().trim().max(30),
  role: z.enum(["super_admin", "contractor", "client"]),
  active: z.boolean(),
  approvedAt: z.string().nullable().optional(),
  approvedBy: z.string().nullable().optional()
});

export const categorySchema = z.object({
  id: z.string().optional().default(""),
  companyId: uuidSchema,
  name: z.string().trim().min(1).max(180),
  description: z.string().trim().max(1000).optional().default(""),
  active: z.boolean()
});

export const itemSchema = z.object({
  id: z.string().optional().default(""),
  companyId: uuidSchema,
  sku: z.string().trim().max(100).optional().default(""),
  name: z.string().trim().min(1).max(250),
  description: z.string().trim().max(3000).optional().default(""),
  itemType: z.enum(["material", "labor", "equipment", "service", "subcontract"]),
  categoryId: z.string().nullable().optional(),
  unitId: uuidSchema,
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),
  wastePercentage: z.number().min(0).max(100),
  active: z.boolean()
});

export const unitSchema = z.object({
  id: z.string().optional().default(""),
  companyId: uuidSchema,
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(150),
  symbol: z.string().trim().min(1).max(30),
  unitType: z.enum(["length", "area", "volume", "weight", "unit", "time", "package", "service"]),
  conversionFactor: z.number().positive(),
  active: z.boolean()
});

export const yieldSchema = z.object({
  id: z.string().optional().default(""),
  companyId: uuidSchema,
  catalogItemId: uuidSchema,
  outputUnitId: uuidSchema,
  name: z.string().trim().min(1).max(200),
  outputQuantity: z.number().positive(),
  laborHours: z.number().min(0),
  crewSize: z.number().positive(),
  wastePercentage: z.number().min(0).max(100),
  notes: z.string().trim().max(2000).optional().default(""),
  active: z.boolean()
});

export const formulaParameterSchema = z.object({
  id: z.string().optional(),
  parameterKey: z.string().trim().min(1).max(150),
  label: z.string().trim().min(1).max(250),
  numericValue: z.number().min(0),
  unitLabel: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  active: z.boolean(),
  sortOrder: z.number().int()
});

export const formulaSchema = z.object({
  id: z.string().optional().default(""),
  companyId: uuidSchema,
  code: z.string().trim().min(1).max(150),
  name: z.string().trim().min(1).max(250),
  description: z.string().trim().max(2000).optional().default(""),
  active: z.boolean(),
  parameters: z.array(formulaParameterSchema).optional().default([])
});

export const globalPriceParamsSchema = z.object({
  itemId: uuidSchema
});

export const globalPriceSchema = z.object({
  unitCost: z.number().min(0),
  salePrice: z.number().min(0),
  wastePercentage: z.number().min(0).max(100)
});

export const adjustPricesSchema = z.object({
  itemIds: z.array(uuidSchema).min(1),
  target: z.enum(["unit_cost", "sale_price"]),
  percentage: z.number().gt(-100),
  notes: z.string().trim().max(2000).optional().default("")
});

export function normalizeCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
