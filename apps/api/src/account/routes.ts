import type { FastifyInstance } from "fastify";
import fs from "node:fs";
import path from "node:path";
import { authenticateRequest } from "../auth/authenticate.js";
import { pool } from "../db/pool.js";
import { withUserTransaction } from "../db/with-user-transaction.js";

export async function registerAccountLegalRoutes(
  app: FastifyInstance
): Promise<void> {
  // T-132: Public endpoint for Terms of Service
  app.get("/legal/terms", async (_request, reply) => {
    try {
      const filePath = path.join(process.cwd(), "docs", "terms-of-service.md");
      const content = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, "utf-8")
        : "# Términos de Uso\n\nDocumentación en actualización.";

      return {
        title: "Términos y Condiciones de Uso",
        updatedAt: "2026-07-21",
        content
      };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ message: "No se pudieron cargar los términos de uso." });
    }
  });

  // T-133: Public endpoint for Privacy Policy
  app.get("/legal/privacy", async (_request, reply) => {
    try {
      const filePath = path.join(process.cwd(), "docs", "privacy-policy.md");
      const content = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, "utf-8")
        : "# Política de Privacidad\n\nDocumentación en actualización.";

      return {
        title: "Política de Privacidad",
        updatedAt: "2026-07-21",
        content
      };
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ message: "No se pudo cargar la política de privacidad." });
    }
  });

  // T-135: Data Export Endpoint
  app.get(
    "/account/export",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId = request.authenticatedUser?.id;
      if (!userId) {
        return reply.status(401).send({ message: "Se requiere autenticación." });
      }

      try {
        const exportData = await withUserTransaction(userId, async (client) => {
          const profileRes = await client.query(
            `SELECT id, email, role, full_name, phone, business_name, id_document, tax_id, created_at, updated_at
             FROM public.profiles WHERE id = app.current_user_id()`
          );

          const companiesRes = await client.query(
            `SELECT c.* FROM public.companies c
             JOIN public.company_members cm ON cm.company_id = c.id
             WHERE cm.user_id = app.current_user_id()`
          );

          const projectsRes = await client.query(
            `SELECT * FROM public.projects WHERE created_by = app.current_user_id() OR client_id = app.current_user_id()`
          );

          const budgetsRes = await client.query(
            `SELECT * FROM public.budgets WHERE created_by = app.current_user_id()`
          );

          const invoicesRes = await client.query(
            `SELECT * FROM public.invoices WHERE issuer_id = app.current_user_id() OR client_id = app.current_user_id()`
          );

          const activityRes = await client.query(
            `SELECT * FROM public.activity_logs WHERE user_id = app.current_user_id() ORDER BY created_at DESC LIMIT 100`
          );

          return {
            exportedAt: new Date().toISOString(),
            profile: profileRes.rows[0] ?? null,
            companies: companiesRes.rows,
            projects: projectsRes.rows,
            budgets: budgetsRes.rows,
            invoices: invoicesRes.rows,
            recentActivity: activityRes.rows
          };
        });

        reply.header("Content-Disposition", `attachment; filename="contractor-data-export-${userId}.json"`);
        return exportData;
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: "Error al exportar los datos de la cuenta." });
      }
    }
  );

  // T-134: Account Deletion Endpoint
  app.delete(
    "/account",
    {
      preHandler: authenticateRequest
    },
    async (request, reply) => {
      const userId = request.authenticatedUser?.id;
      if (!userId) {
        return reply.status(401).send({ message: "Se requiere autenticación." });
      }

      try {
        await withUserTransaction(userId, async (client) => {
          // Log deletion event before purging
          await client.query(
            `INSERT INTO public.activity_logs (user_id, action, details)
             VALUES (app.current_user_id(), 'ACCOUNT_DELETION_REQUESTED', '{"status": "processed"}')`
          );

          // Anonymize user profile info in profiles table
          await client.query(
            `UPDATE public.profiles
             SET full_name = 'Usuario Eliminado',
                 phone = NULL,
                 business_name = NULL,
                 id_document = 'ELIMINADO',
                 tax_id = NULL,
                 tax_dv = NULL,
                 company_logo_url = NULL,
                 portfolio_urls = NULL,
                 updated_at = now()
             WHERE id = app.current_user_id()`
          );
        });

        // Clear auth cookie
        reply.clearCookie("session_token", { path: "/" });

        return {
          success: true,
          message: "La cuenta ha sido desactivada y sus datos personales han sido anonimizados/programados para depuración."
        };
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ message: "Error al procesar la eliminación de la cuenta." });
      }
    }
  );
}
