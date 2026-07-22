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

export const companyMemberParamsSchema = z.object({
  companyId: uuidSchema,
  memberId: uuidSchema
});

export const companyInvitationParamsSchema = z.object({
  companyId: uuidSchema,
  invitationId: uuidSchema
});

export const companyRoleSchema = z.enum([
  "owner",
  "admin",
  "member",
  "supervisor",
  "sales",
  "estimator"
]);

export const invitableCompanyRoleSchema = z.enum([
  "admin",
  "member",
  "supervisor",
  "sales",
  "estimator"
]);

export const createInvitationSchema = z.object({
  email: z.string().trim().email(),
  role: invitableCompanyRoleSchema
});

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(32).max(256).regex(/^[A-Za-z0-9_-]+$/)
});

export const updateMemberStatusSchema = z.object({
  active: z.boolean()
});

export const updateMemberRoleSchema = z.object({
  role: companyRoleSchema
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  action: z.string().trim().optional()
});

