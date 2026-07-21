import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type { createCompanySchema, billingSchema } from "./schemas.js";

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type BillingInput = z.infer<typeof billingSchema>;

export async function findUserCompanyMembershipsRepo(userId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(`
      SELECT
        membership.id,
        membership.company_id,
        membership.user_id,
        membership.role,
        membership.active,
        jsonb_build_object(
          'id', company.id,
          'name', company.name,
          'legal_name', company.legal_name,
          'tax_id', company.tax_id,
          'phone', company.phone,
          'email', company.email,
          'address', company.address,
          'logo_url', company.logo_url,
          'currency_code', company.currency_code,
          'tax_rate', company.tax_rate,
          'timezone', company.timezone,
          'quotation_prefix', company.quotation_prefix,
          'invoice_prefix', company.invoice_prefix,
          'receipt_prefix', company.receipt_prefix,
          'project_prefix', company.project_prefix,
          'payment_prefix', company.payment_prefix,
          'created_by', company.created_by,
          'active', company.active,
          'created_at', company.created_at,
          'updated_at', company.updated_at
        ) AS company
      FROM public.company_members AS membership
      JOIN public.companies AS company ON company.id = membership.company_id
      WHERE membership.user_id = app.current_user_id()
        AND membership.active = true
        AND company.active = true
      ORDER BY membership.created_at ASC
    `);
    return result.rows;
  });
}

export async function createCompanyRepo(userId: string, input: CreateCompanyInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query<{ id: string }>(
      `
        SELECT public.create_company(
          company_name => $1,
          company_phone => $2,
          company_email => $3
        ) AS id
      `,
      [
        input.name,
        input.phone || null,
        input.email ? input.email.toLowerCase() : null
      ]
    );
    return result.rows[0]?.id ?? null;
  });
}

export async function updateCompanyBillingRepo(userId: string, companyId: string, input: BillingInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query<{ id: string }>(
      `
        UPDATE public.companies
        SET
          legal_name = $1,
          tax_id = $2,
          phone = $3,
          email = $4,
          address = $5,
          logo_url = $6,
          invoice_prefix = $7,
          tax_rate = $8,
          updated_at = now()
        WHERE id = $9
          AND EXISTS (
            SELECT 1
            FROM public.company_members AS membership
            WHERE membership.company_id = public.companies.id
              AND membership.user_id = app.current_user_id()
              AND membership.active = true
              AND membership.role IN ('owner', 'admin')
          )
        RETURNING id
      `,
      [
        input.legalName || null,
        input.taxId || null,
        input.phone || null,
        input.email ? input.email.toLowerCase() : null,
        input.address || null,
        input.logoUrl || null,
        input.invoicePrefix || "FAC",
        input.taxRate,
        companyId
      ]
    );
    return result.rows[0] ?? null;
  });
}

// --- Invitaciones de Equipo ---

export async function createCompanyInvitationRepo(
  userId: string,
  companyId: string,
  email: string,
  role: string,
  token: string,
  expiresAt: Date
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.company_invitations (
          company_id, email, role, token, invited_by, status, expires_at
        )
        VALUES ($1, LOWER($2), $3::public.company_role, $4, app.current_user_id(), 'pending', $5)
        RETURNING *
      `,
      [companyId, email, role, token, expiresAt]
    );
    return result.rows[0] ?? null;
  });
}

export async function findCompanyInvitationsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          invitation.*,
          inviter.email AS inviter_email
        FROM public.company_invitations AS invitation
        LEFT JOIN app_auth.users AS inviter ON inviter.id = invitation.invited_by
        WHERE invitation.company_id = $1
          AND invitation.status = 'pending'
          AND invitation.expires_at > now()
        ORDER BY invitation.created_at DESC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function findInvitationByTokenRepo(userId: string, token: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.company_invitations
        WHERE token = $1
      `,
      [token]
    );
    return result.rows[0] ?? null;
  });
}

export async function acceptCompanyInvitationRepo(userId: string, token: string) {
  return withUserTransaction(userId, async (client) => {
    const invResult = await client.query(
      `
        SELECT *
        FROM public.company_invitations
        WHERE token = $1
          AND status = 'pending'
          AND expires_at > now()
      `,
      [token]
    );

    const invitation = invResult.rows[0];
    if (!invitation) return null;

    // Check if user is already member
    const memberCheck = await client.query(
      `
        SELECT *
        FROM public.company_members
        WHERE company_id = $1 AND user_id = app.current_user_id()
      `,
      [invitation.company_id]
    );

    if (memberCheck.rows.length > 0) {
      await client.query(
        `
          UPDATE public.company_members
          SET active = true, role = $1::public.company_role, updated_at = now()
          WHERE company_id = $2 AND user_id = app.current_user_id()
        `,
        [invitation.role, invitation.company_id]
      );
    } else {
      await client.query(
        `
          INSERT INTO public.company_members (company_id, user_id, role, active)
          VALUES ($1, app.current_user_id(), $2::public.company_role, true)
        `,
        [invitation.company_id, invitation.role]
      );
    }

    // Update invitation status
    await client.query(
      `
        UPDATE public.company_invitations
        SET status = 'accepted', updated_at = now()
        WHERE id = $1
      `,
      [invitation.id]
    );

    return invitation;
  });
}

export async function revokeCompanyInvitationRepo(userId: string, companyId: string, invitationId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.company_invitations
        SET status = 'revoked', updated_at = now()
        WHERE id = $1 AND company_id = $2 AND status = 'pending'
        RETURNING *
      `,
      [invitationId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

// --- Administración de Miembros y Control de Roles ---

export async function findCompanyMembersRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          m.id,
          m.company_id,
          m.user_id,
          m.role,
          m.active,
          m.created_at,
          m.updated_at,
          jsonb_build_object(
            'id', u.id,
            'email', u.email,
            'full_name', COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email)
          ) AS user
        FROM public.company_members AS m
        JOIN app_auth.users AS u ON u.id = m.user_id
        LEFT JOIN public.profiles AS p ON p.id = m.user_id
        WHERE m.company_id = $1
        ORDER BY m.created_at ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function findCompanyMemberByIdRepo(userId: string, companyId: string, memberId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT m.*, u.email
        FROM public.company_members AS m
        JOIN app_auth.users AS u ON u.id = m.user_id
        WHERE m.id = $1 AND m.company_id = $2
      `,
      [memberId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function countActiveCompanyOwnersRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM public.company_members
        WHERE company_id = $1
          AND role = 'owner'
          AND active = true
      `,
      [companyId]
    );
    return parseInt(result.rows[0]?.count ?? "0", 10);
  });
}

export async function updateCompanyMemberStatusRepo(
  userId: string,
  companyId: string,
  memberId: string,
  active: boolean
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.company_members
        SET active = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3
        RETURNING *
      `,
      [active, memberId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateCompanyMemberRoleRepo(
  userId: string,
  companyId: string,
  memberId: string,
  role: string
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.company_members
        SET role = $1::public.company_role, updated_at = now()
        WHERE id = $2 AND company_id = $3
        RETURNING *
      `,
      [role, memberId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function deleteCompanyMemberRepo(userId: string, companyId: string, memberId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        DELETE FROM public.company_members
        WHERE id = $1 AND company_id = $2
        RETURNING *
      `,
      [memberId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

// --- Auditoría de Acciones Administrativas ---

export async function insertAdminAuditLogRepo(
  userId: string,
  companyId: string,
  action: string,
  targetType: string,
  targetId: string | null,
  metadata: Record<string, any> = {}
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.admin_audit_logs (
          company_id, user_id, action, target_type, target_id, metadata
        )
        VALUES ($1, app.current_user_id(), $2, $3, $4, $5)
        RETURNING *
      `,
      [companyId, action, targetType, targetId || null, JSON.stringify(metadata)]
    );
    return result.rows[0] ?? null;
  });
}

export async function findAdminAuditLogsRepo(
  userId: string,
  companyId: string,
  page: number,
  limit: number,
  action?: string
) {
  return withUserTransaction(userId, async (client) => {
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        log.*,
        u.email AS user_email,
        p.full_name AS user_full_name,
        COUNT(*) OVER() AS total_count
      FROM public.admin_audit_logs AS log
      JOIN app_auth.users AS u ON u.id = log.user_id
      LEFT JOIN public.profiles AS p ON p.id = log.user_id
      WHERE log.company_id = $1
        AND ($2::text IS NULL OR log.action = $2)
      ORDER BY log.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const result = await client.query(query, [companyId, action || null, limit, offset]);

    const totalItems = parseInt(result.rows[0]?.total_count ?? "0", 10);
    const totalPages = Math.ceil(totalItems / limit);

    const logs = result.rows.map(({ total_count, ...log }) => log);

    return {
      logs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    };
  });
}

