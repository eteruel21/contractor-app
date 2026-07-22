import type { FastifyInstance } from "fastify";
import fs from "node:fs";
import path from "node:path";

import { authenticateRequest } from "../auth/authenticate.js";
import { env } from "../config/env.js";
import { withUserTransaction } from "../db/with-user-transaction.js";

type ProfileStorageReferences = {
  id: string;
  avatar_url: string | null;
  company_logo_url: string | null;
  portfolio_urls: string[] | null;
  doc_id_url: string | null;
  doc_operation_notice_url: string | null;
  doc_technical_certs_urls: string[] | null;
  doc_references_url: string | null;
  doc_address_proof_url: string | null;
};

type ProjectPhotoStorageReference = {
  id: string;
  storage_path: string;
};

type StorageCleanupItem = {
  source: "profile" | "project_photo";
  recordId: string;
  objectReference: string;
};

function getRefreshTokenClearOptions() {
  const isProductionOrStaging =
    env.NODE_ENV === "production" || env.NODE_ENV === "staging";
  const options: {
    path: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    domain?: string;
  } = {
    path: "/",
    httpOnly: true,
    secure: isProductionOrStaging,
    sameSite: isProductionOrStaging ? "none" : "lax"
  };

  if (env.COOKIE_DOMAIN) {
    options.domain = env.COOKIE_DOMAIN;
  }

  return options;
}

function sanitizeStorageReference(value: string): string {
  return value.trim().split(/[?#]/, 1)[0] ?? "";
}

function buildStorageCleanupItems(
  profile: ProfileStorageReferences | undefined,
  photos: ProjectPhotoStorageReference[]
): StorageCleanupItem[] {
  const cleanupItems: StorageCleanupItem[] = [];
  const seen = new Set<string>();

  const addItem = (
    source: StorageCleanupItem["source"],
    recordId: string,
    value: string | null | undefined
  ) => {
    if (!value) {
      return;
    }

    const objectReference = sanitizeStorageReference(value);
    if (!objectReference) {
      return;
    }

    const deduplicationKey = `${source}:${recordId}:${objectReference}`;
    if (seen.has(deduplicationKey)) {
      return;
    }

    seen.add(deduplicationKey);
    cleanupItems.push({ source, recordId, objectReference });
  };

  if (profile) {
    addItem("profile", profile.id, profile.avatar_url);
    addItem("profile", profile.id, profile.company_logo_url);
    addItem("profile", profile.id, profile.doc_id_url);
    addItem("profile", profile.id, profile.doc_operation_notice_url);
    addItem("profile", profile.id, profile.doc_references_url);
    addItem("profile", profile.id, profile.doc_address_proof_url);

    for (const value of profile.portfolio_urls ?? []) {
      addItem("profile", profile.id, value);
    }

    for (const value of profile.doc_technical_certs_urls ?? []) {
      addItem("profile", profile.id, value);
    }
  }

  for (const photo of photos) {
    addItem("project_photo", photo.id, photo.storage_path);
  }

  return cleanupItems;
}

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
      return reply.status(500).send({
        message: "No se pudieron cargar los términos de uso."
      });
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
      return reply.status(500).send({
        message: "No se pudo cargar la política de privacidad."
      });
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
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      try {
        const exportData = await withUserTransaction(userId, async (client) => {
          const accountRes = await client.query(
            `SELECT
               account.id,
               account.email,
               account.email_confirmed_at,
               account.last_sign_in_at,
               account.raw_app_meta_data,
               account.raw_user_meta_data,
               account.created_at,
               account.updated_at,
               account.deleted_at
             FROM app_auth.users AS account
             WHERE account.id = app.current_user_id()`
          );

          const profileRes = await client.query(
            `SELECT profile.*
             FROM public.profiles AS profile
             WHERE profile.id = app.current_user_id()`
          );

          const identitiesRes = await client.query(
            `SELECT
               identity.id,
               identity.provider_id,
               identity.provider,
               identity.identity_data,
               identity.last_sign_in_at,
               identity.created_at,
               identity.updated_at
             FROM app_auth.identities AS identity
             WHERE identity.user_id = app.current_user_id()
             ORDER BY identity.created_at ASC`
          );

          const sessionsRes = await client.query(
            `SELECT
               session.id,
               session.user_agent,
               session.ip_address::text AS ip_address,
               session.created_at,
               session.last_used_at,
               session.expires_at,
               session.revoked_at
             FROM app_auth.sessions AS session
             WHERE session.user_id = app.current_user_id()
             ORDER BY session.created_at DESC`
          );

          const companiesRes = await client.query(
            `SELECT company.*
             FROM public.companies AS company
             WHERE EXISTS (
               SELECT 1
               FROM public.company_members AS membership
               WHERE membership.company_id = company.id
                 AND membership.user_id = app.current_user_id()
             )
             OR EXISTS (
               SELECT 1
               FROM public.clients AS customer
               WHERE customer.company_id = company.id
                 AND customer.user_id = app.current_user_id()
             )
             ORDER BY company.created_at ASC`
          );

          const membershipsRes = await client.query(
            `SELECT membership.*
             FROM public.company_members AS membership
             WHERE membership.user_id = app.current_user_id()
             ORDER BY membership.created_at ASC`
          );

          const clientsRes = await client.query(
            `SELECT customer.*
             FROM public.clients AS customer
             WHERE customer.user_id = app.current_user_id()
                OR customer.created_by = app.current_user_id()
             ORDER BY customer.created_at ASC`
          );

          const clientAddressesRes = await client.query(
            `SELECT address.*
             FROM public.client_addresses AS address
             WHERE EXISTS (
               SELECT 1
               FROM public.clients AS customer
               WHERE customer.id = address.client_id
                 AND customer.company_id = address.company_id
                 AND (
                   customer.user_id = app.current_user_id()
                   OR customer.created_by = app.current_user_id()
                 )
             )
             ORDER BY address.created_at ASC`
          );

          const clientContactsRes = await client.query(
            `SELECT contact.*
             FROM public.client_contacts AS contact
             WHERE EXISTS (
               SELECT 1
               FROM public.clients AS customer
               WHERE customer.id = contact.client_id
                 AND customer.company_id = contact.company_id
                 AND (
                   customer.user_id = app.current_user_id()
                   OR customer.created_by = app.current_user_id()
                 )
             )
             ORDER BY contact.created_at ASC`
          );

          const projectsRes = await client.query(
            `SELECT project.*
             FROM public.projects AS project
             WHERE project.created_by = app.current_user_id()
                OR project.project_manager_id = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.clients AS customer
                  WHERE customer.id = project.client_id
                    AND customer.company_id = project.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY project.created_at ASC`
          );

          const projectMembershipsRes = await client.query(
            `SELECT membership.*
             FROM public.project_members AS membership
             WHERE membership.user_id = app.current_user_id()
             ORDER BY membership.created_at ASC`
          );

          const budgetsRes = await client.query(
            `SELECT budget.*
             FROM public.budgets AS budget
             WHERE budget.created_by = app.current_user_id()
                OR budget.approved_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.clients AS customer
                  WHERE customer.id = budget.client_id
                    AND customer.company_id = budget.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY budget.created_at ASC`
          );

          const budgetHistoryRes = await client.query(
            `SELECT history.*
             FROM public.budget_change_history AS history
             WHERE history.performed_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.budgets AS budget
                  JOIN public.clients AS customer
                    ON customer.id = budget.client_id
                   AND customer.company_id = budget.company_id
                  WHERE budget.id = history.budget_id
                    AND budget.company_id = history.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY history.created_at ASC`
          );

          const savedCalculationsRes = await client.query(
            `SELECT calculation.*
             FROM public.saved_calculations AS calculation
             WHERE calculation.created_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.clients AS customer
                  WHERE customer.id = calculation.client_id
                    AND customer.company_id = calculation.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY calculation.created_at ASC`
          );

          const invoicesRes = await client.query(
            `SELECT invoice.*
             FROM public.invoices AS invoice
             WHERE invoice.created_by = app.current_user_id()
                OR invoice.issued_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.clients AS customer
                  WHERE customer.id = invoice.client_id
                    AND customer.company_id = invoice.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY invoice.created_at ASC`
          );

          const invoiceHistoryRes = await client.query(
            `SELECT history.*
             FROM public.invoice_history AS history
             WHERE history.actor_user_id = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.invoices AS invoice
                  JOIN public.clients AS customer
                    ON customer.id = invoice.client_id
                   AND customer.company_id = invoice.company_id
                  WHERE invoice.id = history.invoice_id
                    AND invoice.company_id = history.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY history.created_at ASC`
          );

          const invoicePaymentsRes = await client.query(
            `SELECT payment.*
             FROM public.invoice_payments AS payment
             WHERE payment.created_by = app.current_user_id()
                OR payment.reversed_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.invoices AS invoice
                  JOIN public.clients AS customer
                    ON customer.id = invoice.client_id
                   AND customer.company_id = invoice.company_id
                  WHERE invoice.id = payment.invoice_id
                    AND invoice.company_id = payment.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY payment.created_at ASC`
          );

          const invoiceCreditNotesRes = await client.query(
            `SELECT credit_note.*
             FROM public.invoice_credit_notes AS credit_note
             WHERE credit_note.issued_by = app.current_user_id()
                OR credit_note.cancelled_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.invoices AS invoice
                  JOIN public.clients AS customer
                    ON customer.id = invoice.client_id
                   AND customer.company_id = invoice.company_id
                  WHERE invoice.id = credit_note.invoice_id
                    AND invoice.company_id = credit_note.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY credit_note.created_at ASC`
          );

          const activitiesRes = await client.query(
            `SELECT activity.*
             FROM public.activities AS activity
             WHERE activity.created_by = app.current_user_id()
                OR activity.assigned_user_id = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.clients AS customer
                  WHERE customer.id = activity.client_id
                    AND customer.company_id = activity.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY activity.created_at ASC`
          );

          const projectTasksRes = await client.query(
            `SELECT task.*
             FROM public.project_tasks AS task
             WHERE task.created_by = app.current_user_id()
                OR task.assigned_user_id = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.projects AS project
                  JOIN public.clients AS customer
                    ON customer.id = project.client_id
                   AND customer.company_id = project.company_id
                  WHERE project.id = task.project_id
                    AND project.company_id = task.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY task.created_at ASC`
          );

          const projectProgressRes = await client.query(
            `SELECT progress.*
             FROM public.project_progress_history AS progress
             WHERE progress.created_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.projects AS project
                  JOIN public.clients AS customer
                    ON customer.id = project.client_id
                   AND customer.company_id = project.company_id
                  WHERE project.id = progress.project_id
                    AND project.company_id = progress.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY progress.created_at ASC`
          );

          const projectPhotosRes = await client.query(
            `SELECT photo.*
             FROM public.project_photos AS photo
             WHERE photo.created_by = app.current_user_id()
                OR EXISTS (
                  SELECT 1
                  FROM public.projects AS project
                  JOIN public.clients AS customer
                    ON customer.id = project.client_id
                   AND customer.company_id = project.company_id
                  WHERE project.id = photo.project_id
                    AND project.company_id = photo.company_id
                    AND customer.user_id = app.current_user_id()
                )
             ORDER BY photo.created_at ASC`
          );

          const notificationsRes = await client.query(
            `SELECT notification.*
             FROM public.notifications AS notification
             WHERE notification.user_id = app.current_user_id()
             ORDER BY notification.created_at ASC`
          );

          const invitationsRes = await client.query(
            `SELECT
               invitation.id,
               invitation.company_id,
               invitation.email,
               invitation.role,
               invitation.invited_by,
               invitation.status,
               invitation.expires_at,
               invitation.created_at,
               invitation.updated_at
             FROM public.company_invitations AS invitation
             WHERE invitation.invited_by = app.current_user_id()
                OR lower(invitation.email) = lower((
                  SELECT account.email
                  FROM app_auth.users AS account
                  WHERE account.id = app.current_user_id()
                ))
             ORDER BY invitation.created_at ASC`
          );

          const auditLogsRes = await client.query(
            `SELECT audit_log.*
             FROM public.admin_audit_logs AS audit_log
             WHERE audit_log.user_id = app.current_user_id()
             ORDER BY audit_log.created_at ASC`
          );

          const catalogOverridesRes = await client.query(
            `SELECT override.*
             FROM public.user_catalog_price_overrides AS override
             WHERE override.user_id = app.current_user_id()
             ORDER BY override.created_at ASC`
          );

          return {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            account: accountRes.rows[0] ?? null,
            profile: profileRes.rows[0] ?? null,
            authentication: {
              identities: identitiesRes.rows,
              sessions: sessionsRes.rows
            },
            organizations: {
              companies: companiesRes.rows,
              memberships: membershipsRes.rows,
              invitations: invitationsRes.rows
            },
            commercial: {
              clients: clientsRes.rows,
              clientAddresses: clientAddressesRes.rows,
              clientContacts: clientContactsRes.rows,
              projects: projectsRes.rows,
              projectMemberships: projectMembershipsRes.rows,
              budgets: budgetsRes.rows,
              budgetHistory: budgetHistoryRes.rows,
              savedCalculations: savedCalculationsRes.rows,
              invoices: invoicesRes.rows,
              invoiceHistory: invoiceHistoryRes.rows,
              invoicePayments: invoicePaymentsRes.rows,
              invoiceCreditNotes: invoiceCreditNotesRes.rows
            },
            operations: {
              activities: activitiesRes.rows,
              projectTasks: projectTasksRes.rows,
              projectProgress: projectProgressRes.rows,
              projectPhotos: projectPhotosRes.rows
            },
            communications: {
              notifications: notificationsRes.rows
            },
            administrativeAuditLogs: auditLogsRes.rows,
            catalogPriceOverrides: catalogOverridesRes.rows
          };
        });

        reply.header(
          "Content-Disposition",
          `attachment; filename="contractor-data-export-${userId}.json"`
        );
        reply.header("Cache-Control", "no-store");
        return exportData;
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          message: "Error al exportar los datos de la cuenta."
        });
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
        return reply.status(401).send({
          message: "Se requiere autenticación."
        });
      }

      try {
        const deletionResult = await withUserTransaction(
          userId,
          async (client) => {
            const profileStorageRes = await client.query<ProfileStorageReferences>(
              `SELECT
                 profile.id,
                 profile.avatar_url,
                 profile.company_logo_url,
                 profile.portfolio_urls,
                 profile.doc_id_url,
                 profile.doc_operation_notice_url,
                 profile.doc_technical_certs_urls,
                 profile.doc_references_url,
                 profile.doc_address_proof_url
               FROM public.profiles AS profile
               WHERE profile.id = app.current_user_id()`
            );

            const photoStorageRes =
              await client.query<ProjectPhotoStorageReference>(
                `SELECT photo.id, photo.storage_path
                 FROM public.project_photos AS photo
                 WHERE photo.created_by = app.current_user_id()
                 ORDER BY photo.created_at ASC`
              );

            const storageCleanupItems = buildStorageCleanupItems(
              profileStorageRes.rows[0],
              photoStorageRes.rows
            );

            await client.query(
              `UPDATE public.profiles
               SET full_name = NULL,
                   phone = NULL,
                   avatar_url = NULL,
                   first_name = NULL,
                   last_name = NULL,
                   province = NULL,
                   district = NULL,
                   corregimiento = NULL,
                   terms_accepted = false,
                   notifications_opt_in = false,
                   registration_ip = NULL,
                   registration_device = NULL,
                   business_name = NULL,
                   id_document = NULL,
                   tax_id = NULL,
                   tax_dv = NULL,
                   primary_category = NULL,
                   specialties = NULL,
                   experience_years = NULL,
                   work_areas = NULL,
                   professional_description = NULL,
                   company_logo_url = NULL,
                   portfolio_urls = NULL,
                   certifications = NULL,
                   availability = NULL,
                   preferred_contact_method = NULL,
                   emits_invoice = false,
                   has_transport = false,
                   work_mode = NULL,
                   doc_id_url = NULL,
                   doc_operation_notice_url = NULL,
                   doc_technical_certs_urls = NULL,
                   doc_references_url = NULL,
                   doc_address_proof_url = NULL,
                   updated_at = now()
               WHERE id = app.current_user_id()`
            );

            await client.query(
              `UPDATE app_auth.identities
               SET provider_id = 'deleted:' || id::text,
                   identity_data = '{}'::jsonb,
                   last_sign_in_at = NULL,
                   updated_at = now()
               WHERE user_id = app.current_user_id()`
            );

            await client.query(
              `UPDATE app_auth.tokens
               SET token_hash = 'revoked:' || id::text,
                   used_at = COALESCE(used_at, now())
               WHERE user_id = app.current_user_id()`
            );

            await client.query(
              `UPDATE app_auth.sessions
               SET refresh_token_hash = 'revoked:' || id::text,
                   user_agent = NULL,
                   ip_address = NULL,
                   revoked_at = COALESCE(revoked_at, now())
               WHERE user_id = app.current_user_id()`
            );

            const deletedAccountRes = await client.query<{ id: string }>(
              `UPDATE app_auth.users
               SET email = NULL,
                   password_hash = NULL,
                   email_confirmed_at = NULL,
                   last_sign_in_at = NULL,
                   raw_app_meta_data = '{}'::jsonb,
                   raw_user_meta_data = '{}'::jsonb,
                   deleted_at = COALESCE(deleted_at, now()),
                   updated_at = now()
               WHERE id = app.current_user_id()
               RETURNING id`
            );

            if (!deletedAccountRes.rows[0]) {
              throw new Error("No se encontró la cuenta que se desea eliminar.");
            }

            return { storageCleanupItems };
          }
        );

        reply.clearCookie(
          "refreshToken",
          getRefreshTokenClearOptions()
        );

        return {
          success: true,
          accountStatus: "deleted",
          authenticationDisabled: true,
          profilePersonalDataAnonymized: true,
          sessionsRevoked: true,
          storageCleanup: {
            status:
              deletionResult.storageCleanupItems.length > 0
                ? "pending"
                : "not_required",
            objectCount: deletionResult.storageCleanupItems.length,
            objects: deletionResult.storageCleanupItems,
            note:
              deletionResult.storageCleanupItems.length > 0
                ? "Estos objetos requieren eliminación posterior en el proveedor de almacenamiento."
                : "No se encontraron objetos externos asociados a la cuenta."
          }
        };
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          message: "Error al procesar la eliminación de la cuenta."
        });
      }
    }
  );
}
