import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type { createInvoiceSchema } from "./schemas.js";

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

const invoiceDetailsSql = `
  SELECT
    invoice.*,
    CASE WHEN customer.id IS NULL THEN NULL ELSE to_jsonb(customer) END AS client,
    CASE WHEN budget.id IS NULL THEN NULL ELSE to_jsonb(budget) END AS budget
  FROM public.invoices AS invoice
  LEFT JOIN public.clients AS customer ON customer.id = invoice.client_id
  LEFT JOIN public.budgets AS budget ON budget.id = invoice.budget_id
`;

export async function findInvoicesRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${invoiceDetailsSql}
        WHERE invoice.company_id = $1
        ORDER BY invoice.created_at DESC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function findInvoiceByBudgetRepo(userId: string, companyId: string, budgetId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.invoices
        WHERE company_id = $1 AND budget_id = $2
        LIMIT 1
      `,
      [companyId, budgetId]
    );
    return result.rows[0] ?? null;
  });
}

export async function getInvoiceByIdRepo(userId: string, invoiceId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${invoiceDetailsSql}
        WHERE invoice.id = $1 AND invoice.company_id = $2
        LIMIT 1
      `,
      [invoiceId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function createInvoiceRepo(userId: string, input: CreateInvoiceInput) {
  return withUserTransaction(userId, async (client) => {
    const createResult = await client.query<{ id: string | null }>(
      `
        SELECT public.create_invoice(
          $1, $2, $3, $4::date, $5
        ) AS id
      `,
      [
        input.companyId,
        input.clientId,
        input.budgetId,
        input.dueDate ?? null,
        input.notes ?? null
      ]
    );

    const invoiceId = createResult.rows[0]?.id;
    if (!invoiceId) return null;

    const result = await client.query(
      `
        SELECT *
        FROM public.invoices
        WHERE id = $1
        LIMIT 1
      `,
      [invoiceId]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateInvoiceStatusRepo(userId: string, invoiceId: string, companyId: string, status: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.invoices
        SET status = $1::public.invoice_status, updated_at = now()
        WHERE id = $2 AND company_id = $3
      `,
      [status, invoiceId, companyId]
    );
  });
}
