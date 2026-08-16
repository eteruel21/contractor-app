import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "test", "production"])
    .default("development"),

  DATABASE_MODE: z
    .enum(["postgres", "hyperdrive"])
    .default("postgres"),

  CAPTCHA_SECRET: z.string().optional(),
  CAPTCHA_ENABLED: z.coerce.boolean().default(false),

  SMTP_HOST: z.string().trim().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().trim().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  EMAIL_FROM: z.string().trim().min(1).optional(),

  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().default("contractor-private-storage"),
  S3_REGION: z.string().default("auto"),
  COOKIE_DOMAIN: z.string().optional(),

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
      "https://contractor-admin-web.pages.dev,https://contractor-pro-web.pages.dev,https://admin.contractor.com.pa,https://app.contractor.com.pa,https://staging-admin.contractor.app,https://staging-app.contractor.app,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://127.0.0.1:8081"
    ),

  PGHOST: z.string().trim().min(1).optional(),

  PGPORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .optional(),

  PGDATABASE: z.string().trim().min(1).optional(),
  PGUSER: z.string().trim().min(1).optional(),
  PGPASSWORD: z.string().min(1).optional(),

  PGSSL: z
    .enum(["disable", "require", "verify-full"])
    .default("disable"),

  PGSSL_CA_FILE: z.string().trim().min(1).optional(),

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
}).superRefine(
  (environment, context) => {
    if (environment.DATABASE_MODE === "postgres") {
      const requiredPostgresFields = [
        ["PGHOST", environment.PGHOST],
        ["PGPORT", environment.PGPORT],
        ["PGDATABASE", environment.PGDATABASE],
        ["PGUSER", environment.PGUSER],
        ["PGPASSWORD", environment.PGPASSWORD]
      ] as const;

      for (const [field, value] of requiredPostgresFields) {
        if (value === undefined || value === "") {
          context.addIssue({
            code: "custom",
            path: [field],
            message: `${field} es obligatorio cuando DATABASE_MODE=postgres.`
          });
        }
      }

      if (
        environment.NODE_ENV === "production" &&
        environment.PGSSL !== "verify-full"
      ) {
        context.addIssue({
          code: "custom",
          path: ["PGSSL"],
          message:
            "PGSSL=verify-full es obligatorio en producción."
        });
      }

      if (
        environment.PGSSL === "verify-full" &&
        !environment.PGSSL_CA_FILE
      ) {
        context.addIssue({
          code: "custom",
          path: ["PGSSL_CA_FILE"],
          message:
            "PGSSL_CA_FILE es obligatorio cuando PGSSL=verify-full."
        });
      }
    }
  }
);

const parsedEnvironment =
  environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const invalidFields = Object.keys(parsedEnvironment.error.flatten().fieldErrors);
  console.error("Configuración inválida.", { invalidFields });

  throw new Error(
    "No se pudo cargar la configuración de la API."
  );
}

export const env = parsedEnvironment.data;

export const corsOrigins = env.CORS_ORIGINS
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
