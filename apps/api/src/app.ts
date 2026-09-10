import { registerAdminRoutes } from "./admin/routes.js";
import { registerInvoiceRoutes } from "./invoices/routes.js";
import { registerOperationRoutes } from "./operations/routes.js";
import { registerBudgetRoutes } from "./budgets/routes.js";
import { registerCalculationRoutes } from "./calculations/routes.js";
import { registerProjectRoutes } from "./projects/routes.js";
import { registerClientRoutes } from "./clients/routes.js";
import { registerCompanyRoutes } from "./companies/routes.js";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";

import { registerAuthRoutes } from "./auth/routes.js";
import { corsOrigins, env } from "./config/env.js";
import { registerCatalogRoutes } from "./catalog/routes.js";
import { pool } from "./db/pool.js";
import { registerProfileRoutes } from "./profile/routes.js";
import { registerActivityRoutes } from "./activities/routes.js";
import { registerProjectTaskRoutes } from "./projects/tasks/routes.js";
import { registerProjectProgressRoutes } from "./projects/progress/routes.js";
import { registerStorageRoutes } from "./storage/routes.js";
import { registerNotificationRoutes } from "./notifications/routes.js";
import { registerAccountLegalRoutes } from "./account/routes.js";
import { safeErrorDetails } from "./security/redaction.js";
import { getClientIp } from "./security/client-ip.js";

export async function buildApp() {
  const app = Fastify({
    logger: false
  });

  app.decorateRequest("authenticatedUser", null);

  app.setErrorHandler((error, request, reply) => {
    request.log.error(
      safeErrorDetails(error),
      "Error no controlado en la API."
    );
    const errorStatusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error
        ? error.statusCode
        : undefined;
    const statusCode =
      typeof errorStatusCode === "number" &&
      errorStatusCode >= 400 &&
      errorStatusCode < 500
        ? errorStatusCode
        : 500;
    return reply.status(statusCode).send({
      message:
        statusCode < 500
          ? "La solicitud no pudo ser procesada."
          : "Ocurrió un error interno."
    });
  });

  app.register(cors, {
    origin: corsOrigins,
    credentials: true
  });

  app.register(fastifyCookie, {
    secret: env.JWT_SECRET,
    hook: "onRequest"
  });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; sandbox;");
    reply.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    reply.header("X-Frame-Options", "DENY");
    reply.header("X-XSS-Protection", "0");
  });

  app.register(rateLimit, {
    global: false,
    keyGenerator: (request) => getClientIp(request),
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Demasiados intentos. Inténtalo nuevamente más tarde."
    })
  });

  app.register(registerAuthRoutes);
  app.register(registerCatalogRoutes);
  app.register(registerProfileRoutes);
  app.register(registerCompanyRoutes);
  app.register(registerClientRoutes);
  app.register(registerProjectRoutes);
  app.register(registerBudgetRoutes);
  app.register(registerCalculationRoutes);
  app.register(registerOperationRoutes);
  app.register(registerInvoiceRoutes);
  app.register(registerAdminRoutes);
  app.register(registerActivityRoutes);
  app.register(registerProjectTaskRoutes);
  app.register(registerProjectProgressRoutes);
  app.register(registerStorageRoutes);
  app.register(registerNotificationRoutes);
  app.register(registerAccountLegalRoutes);

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "contractor-api",
      environment: env.NODE_ENV
    };
  });

  app.get("/health/database", async (_request, reply) => {
    try {
      const result = await pool.query<{
        database_name: string;
        database_user: string;
        server_time: Date;
      }>(`
        SELECT
          current_database() AS database_name,
          current_user AS database_user,
          now() AS server_time
      `);

      const row = result.rows[0];
      if (!row) {
        throw new Error("No se pudo obtener información de la base de datos.");
      }

      return {
        status: "ok",
        database: row
      };
    } catch (error) {
      app.log.error(safeErrorDetails(error), "Falló la comprobación de PostgreSQL.");
      return reply.status(503).send({
        status: "error",
        message: "No se pudo conectar con PostgreSQL."
      });
    }
  });

  return app;
}
