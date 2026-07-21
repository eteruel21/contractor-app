import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const calculationParamsSchema = z.object({
  calculationId: uuidSchema
});

export const listCalculationsSchema = z.object({
  companyId: uuidSchema,
  projectId: uuidSchema.optional(),
  clientId: uuidSchema.optional()
});

export const saveCalculationSchema = z.object({
  companyId: uuidSchema,
  projectId: uuidSchema.nullable().optional(),
  clientId: uuidSchema.nullable().optional(),
  formulaCode: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(250),
  inputData: z.record(z.string(), z.any()).optional().default({}),
  priceData: z.record(z.string(), z.any()).optional().default({}),
  resultsData: z.record(z.string(), z.any()).optional().default({}),
  totalCost: z.number().min(0).optional().default(0)
});
