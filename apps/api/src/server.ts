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
import fastifyCookie from "@fastify/cookie";

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
  logger: {
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['set-cookie']",
        "req.headers['x-api-key']",
        "req.body.password",
        "req.body.newPassword",
        "req.body.refreshToken",
        "req.body.captchaToken",
        "req.body.token",
        "res.headers['set-cookie']",
        "req.body.idDocument",
        "req.body.taxId",
        "req.body.id_document",
        "req.body.tax_id",
        "req.body.docIdUrl",
        "req.body.doc_id_url",
        "req.body.docOperationNoticeUrl",
        "req.body.doc_operation_notice_url",
        "req.body.docTechnicalCertsUrls",
        "req.body.doc_technical_certs_urls",
        "req.body.docReferencesUrl",
        "req.body.doc_references_url",
        "req.body.docAddressProofUrl",
        "req.body.doc_address_proof_url"
      ],
      censor: "[REDACTED]"
    }
  }
});

app.decorateRequest(
  "authenticatedUser",
  null
);

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

      const row = result.rows[0];
      if (!row) {
        throw new Error("No se pudo obtener información de la base de datos.");
      }

      if (env.NODE_ENV === "production") {
        return {
          status: "ok",
          database: {
            status: "connected",
            server_time: row.server_time
          }
        };
      }

      return {
        status: "ok",
        database: row
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