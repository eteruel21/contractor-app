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
