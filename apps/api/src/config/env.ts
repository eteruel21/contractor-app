import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "test", "production"])
    .default("development"),

  CAPTCHA_SECRET: z.string().optional(),
  CAPTCHA_ENABLED: z.coerce.boolean().default(false),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  API_HOST: z.string().min(1).default("127.0.0.1"),

  API_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3001),

  CORS_ORIGINS: z
    .string()
    .default(
      "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://127.0.0.1:8081"
    ),

  PGHOST: z.string().min(1),

  PGPORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535),

  PGDATABASE: z.string().min(1),
  PGUSER: z.string().min(1),
  PGPASSWORD: z.string().min(1),

  PGSSL: z
    .enum(["disable", "require"])
    .default("disable"),

  JWT_SECRET: z.string().min(43),

  JWT_ISSUER: z
    .string()
    .min(1)
    .default("contractor-api"),

  JWT_AUDIENCE: z
    .string()
    .min(1)
    .default("contractor-app"),

  ACCESS_TOKEN_MINUTES: z.coerce
    .number()
    .int()
    .min(5)
    .max(60)
    .default(15),

  REFRESH_TOKEN_DAYS: z.coerce
    .number()
    .int()
    .min(1)
    .max(90)
    .default(30)
});

const parsedEnvironment =
  environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error(
    "Configuración inválida:",
    parsedEnvironment.error.flatten().fieldErrors
  );

  throw new Error(
    "No se pudo cargar la configuración de la API."
  );
}

export const env = parsedEnvironment.data;

export const corsOrigins = env.CORS_ORIGINS
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);