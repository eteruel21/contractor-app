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

export async function buildApp() {
  const app = Fastify({
    logger: false
  });

  app.decorateRequest("authenticatedUser", null);

  await app.register(cors, {
    origin: corsOrigins,
    credentials: true
  });

  await app.register(fastifyCookie, {
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

  await app.register(rateLimit, {
    global: false
  });

  await app.register(registerAuthRoutes);
  await app.register(registerCatalogRoutes);
  await app.register(registerProfileRoutes);
  await app.register(registerCompanyRoutes);
  await app.register(registerClientRoutes);
  await app.register(registerProjectRoutes);
  await app.register(registerBudgetRoutes);
  await app.register(registerCalculationRoutes);
  await app.register(registerOperationRoutes);
  await app.register(registerInvoiceRoutes);
  await app.register(registerAdminRoutes);
  await app.register(registerActivityRoutes);
  await app.register(registerProjectTaskRoutes);
  await app.register(registerProjectProgressRoutes);
  await app.register(registerStorageRoutes);
  await app.register(registerNotificationRoutes);

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
      app.log.error(error);
      return reply.status(503).send({
        status: "error",
        message: "No se pudo conectar con PostgreSQL."
      });
    }
  });

  return app;
}
