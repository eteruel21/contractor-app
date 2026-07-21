import { z } from "zod";

const uuidSchema = z.string().uuid();

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1).max(128),
  clientType: z.string().optional()
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z.string().min(8).max(72),

  role: z
    .enum(["contractor", "client"])
    .default("client"),

  province: z.string().trim().min(1).max(100),
  district: z.string().trim().min(1).max(100),
  corregimiento: z.string().trim().min(1).max(100),

  termsAccepted: z.literal(true),

  notificationsOptIn: z
    .boolean()
    .default(false),

  registrationDevice: z
    .string()
    .trim()
    .max(250)
    .optional()
    .default(""),

  captchaToken: z
    .string()
    .trim()
    .min(1)
    .optional()
    .default("mock-captcha-token")
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(40).max(500).optional(),
  clientType: z.string().optional()
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().length(64)
});

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
});

export const recoverPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().length(64),
  newPassword: z.string().min(8).max(72)
});

export const revokeSessionSchema = z.object({
  sessionId: uuidSchema
});
