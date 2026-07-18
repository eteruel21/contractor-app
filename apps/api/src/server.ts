import {
  registerAdminRoutes
} from "./admin/routes.js";
import {
  registerInvoiceRoutes
} from "./invoices/routes.js";
import {
  registerOperationRoutes
} from "./operations/routes.js";
import {
  registerBudgetRoutes
} from "./budgets/routes.js";
import {
  registerProjectRoutes
} from "./projects/routes.js";
import {
  registerClientRoutes
} from "./clients/routes.js";
import {
  registerCompanyRoutes
} from "./companies/routes.js";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";

import {
  registerAuthRoutes
} from "./auth/routes.js";
import {
  corsOrigins,
  env
} from "./config/env.js";
import {
  registerCatalogRoutes
} from "./catalog/routes.js";
import { pool } from "./db/pool.js";
import {
  registerProfileRoutes
} from "./profile/routes.js";

const app = Fastify({
  logger: true
});

app.decorateRequest(
  "authenticatedUser",
  null
);

await app.register(cors, {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    try {
      const hostname = new URL(origin).hostname;
      if (hostname === "pages.dev" || hostname.endsWith(".pages.dev")) {
        callback(null, true);
        return;
      }
    } catch {
      // ignore invalid URLs
    }
    callback(null, false);
  },
  credentials: false
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

await app.register(registerOperationRoutes);
await app.register(registerInvoiceRoutes);

await app.register(registerAdminRoutes);

app.get("/health", async () => {
  return {
    status: "ok",
    service: "contractor-api",
    environment: env.NODE_ENV
  };
});

app.get(
  "/health/database",
  async (_request, reply) => {
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

      return {
        status: "ok",
        database: result.rows[0]
      };
    } catch (error) {
      app.log.error(error);

      return reply.status(503).send({
        status: "error",
        message:
          "No se pudo conectar con PostgreSQL."
      });
    }
  }
);

const closeApplication = async (
  signal: string
): Promise<void> => {
  app.log.info(
    { signal },
    "Cerrando la API"
  );

  await app.close();
  await pool.end();

  process.exit(0);
};

process.on("SIGINT", () => {
  void closeApplication("SIGINT");
});

process.on("SIGTERM", () => {
  void closeApplication("SIGTERM");
});

try {
  await app.listen({
    host: env.API_HOST,
    port: env.API_PORT
  });
} catch (error) {
  app.log.error(error);
  await pool.end();
  process.exit(1);
}