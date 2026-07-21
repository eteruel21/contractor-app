import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const projectStatusSchema = z.enum([
  "lead",
  "inspection",
  "quoted",
  "approved",
  "in_progress",
  "paused",
  "completed",
  "cancelled"
]);

export const projectParamsSchema = z.object({
  projectId: uuidSchema
});

export const projectQuerySchema = z.object({
  companyId: uuidSchema,
  clientId: uuidSchema.optional()
});

export const companyQuerySchema = z.object({
  companyId: uuidSchema
});

export const createProjectSchema = z.object({
  companyId: uuidSchema,
  clientId: uuidSchema,
  addressId: uuidSchema.nullable().optional(),
  name: z.string().trim().min(2).max(250),
  description: z.string().trim().max(3000).optional().default(""),
  budgetEstimate: z.number().min(0).optional().default(0)
});

export const statusSchema = z.object({
  companyId: uuidSchema,
  status: projectStatusSchema
});

export const progressSchema = z.object({
  companyId: uuidSchema,
  progressPercentage: z.number().min(0).max(100)
});
