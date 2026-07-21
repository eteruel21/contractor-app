import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type {
  cancelInvoiceCreditNoteSchema,
  cancelInvoiceSchema,
  createInvoicePaymentSchema,
  createInvoiceCreditNoteSchema,
  createInvoiceSchema,
  invoiceStatusSchema,
  reverseInvoicePaymentSchema
} from "./schemas.js";

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type TransitionInvoiceStatusInput = z.infer<typeof invoiceStatusSchema>;
export type CreateInvoicePaymentInput = z.infer<typeof createInvoicePaymentSchema>;
export type ReverseInvoicePaymentInput = z.infer<typeof reverseInvoicePaymentSchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
export type CreateInvoiceCreditNoteInput = z.infer<typeof createInvoiceCreditNoteSchema>;
export type CancelInvoiceCreditNoteInput = z.infer<typeof cancelInvoiceCreditNoteSchema>;

const invoiceDetailsSql = `
  SELECT
    invoice.*,
    CASE WHEN customer.id IS NULL THEN NULL ELSE to_jsonb(customer) END AS client,
    CASE WHEN budget.id IS NULL THEN NULL ELSE to_jsonb(budget) END AS budget,
    CASE
      WHEN invoice.snapshot_data IS NULL THEN NULL
      ELSE (invoice.snapshot_data #>> '{totals,total}')::double precision
    END AS total_amount,
    CASE
      WHEN invoice.snapshot_data IS NULL THEN NULL
      ELSE GREATEST(
        (invoice.snapshot_data #>> '{totals,total}')::numeric
          - credit_summary.total_credit,
        0
      )::double precision
    END AS adjusted_total_amount,
    payment_summary.total_paid::double precision AS total_paid,
    credit_summary.total_credit::double precision AS total_credit,
    CASE
      WHEN invoice.snapshot_data IS NULL THEN NULL
      ELSE GREATEST(
        (invoice.snapshot_data #>> '{totals,total}')::numeric
          - credit_summary.total_credit
          - payment_summary.total_paid,
        0
      )::double precision
    END AS balance_due,
    CASE
      WHEN invoice.snapshot_data IS NULL THEN 0
      ELSE GREATEST(
        payment_summary.total_paid
          - (
            (invoice.snapshot_data #>> '{totals,total}')::numeric
              - credit_summary.total_credit
          ),
        0
      )::double precision
    END AS customer_credit,
    payment_summary.payment_count::integer AS payment_count,
    credit_summary.credit_note_count::integer AS credit_note_count
  FROM public.invoices AS invoice
  LEFT JOIN public.clients AS customer ON customer.id = invoice.client_id
  LEFT JOIN public.budgets AS budget ON budget.id = invoice.budget_id
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(sum(payment.amount), 0) AS total_paid,
      count(*) FILTER (
        WHERE payment.status = 'confirmed'::public.invoice_payment_status
      ) AS payment_count
    FROM public.invoice_payments AS payment
    WHERE payment.invoice_id = invoice.id
      AND payment.company_id = invoice.company_id
      AND payment.status = 'confirmed'::public.invoice_payment_status
  ) AS payment_summary ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(sum(credit_note.amount), 0) AS total_credit,
      count(*) FILTER (
        WHERE credit_note.status = 'issued'::public.invoice_credit_note_status
      ) AS credit_note_count
    FROM public.invoice_credit_notes AS credit_note
    WHERE credit_note.invoice_id = invoice.id
      AND credit_note.company_id = invoice.company_id
      AND credit_note.status = 'issued'::public.invoice_credit_note_status
  ) AS credit_summary ON true
`;

const paymentDetailsSql = `
  SELECT
    payment.*,
    payment.amount::double precision AS amount
  FROM public.invoice_payments AS payment
`;

const creditNoteDetailsSql = `
  SELECT
    credit_note.*,
    credit_note.amount::double precision AS amount
  FROM public.invoice_credit_notes AS credit_note
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
        ${invoiceDetailsSql}
        WHERE invoice.company_id = $1 AND invoice.budget_id = $2
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

export async function findInvoiceHistoryRepo(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT history.*
        FROM public.invoice_history AS history
        WHERE history.invoice_id = $1
          AND history.company_id = $2
        ORDER BY history.created_at ASC, history.id ASC
      `,
      [invoiceId, companyId]
    );

    return result.rows;
  });
}

export async function findInvoicePaymentsRepo(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${paymentDetailsSql}
        WHERE payment.invoice_id = $1
          AND payment.company_id = $2
        ORDER BY payment.paid_at DESC, payment.created_at DESC, payment.id DESC
      `,
      [invoiceId, companyId]
    );

    return result.rows;
  });
}

export async function findInvoiceCreditNotesRepo(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${creditNoteDetailsSql}
        WHERE credit_note.invoice_id = $1
          AND credit_note.company_id = $2
        ORDER BY credit_note.issued_at DESC,
          credit_note.created_at DESC,
          credit_note.id DESC
      `,
      [invoiceId, companyId]
    );

    return result.rows;
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
        ${invoiceDetailsSql}
        WHERE invoice.id = $1 AND invoice.company_id = $2
        LIMIT 1
      `,
      [invoiceId, input.companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function issueInvoiceRepo(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return withUserTransaction(userId, async (client) => {
    const issueResult = await client.query<{ id: string | null }>(
      `
        SELECT public.issue_invoice($1, $2) AS id
      `,
      [invoiceId, companyId]
    );

    const issuedInvoiceId = issueResult.rows[0]?.id;
    if (!issuedInvoiceId) return null;

    const result = await client.query(
      `
        ${invoiceDetailsSql}
        WHERE invoice.id = $1 AND invoice.company_id = $2
        LIMIT 1
      `,
      [issuedInvoiceId, companyId]
    );

    return result.rows[0] ?? null;
  });
}

export async function transitionInvoiceStatusRepo(
  userId: string,
  invoiceId: string,
  input: TransitionInvoiceStatusInput
) {
  return withUserTransaction(userId, async (client) => {
    const transitionResult = await client.query<{ id: string | null }>(
      `
        SELECT public.transition_invoice_status(
          $1,
          $2,
          $3::public.invoice_status,
          $4
        ) AS id
      `,
      [
        invoiceId,
        input.companyId,
        input.status,
        input.reason ?? null
      ]
    );

    const transitionedInvoiceId = transitionResult.rows[0]?.id;
    if (!transitionedInvoiceId) return null;

    const result = await client.query(
      `
        ${invoiceDetailsSql}
        WHERE invoice.id = $1 AND invoice.company_id = $2
        LIMIT 1
      `,
      [transitionedInvoiceId, input.companyId]
    );

    return result.rows[0] ?? null;
  });
}

export async function recordInvoicePaymentRepo(
  userId: string,
  invoiceId: string,
  input: CreateInvoicePaymentInput
) {
  return withUserTransaction(userId, async (client) => {
    const createResult = await client.query<{ id: string | null }>(
      `
        SELECT public.record_invoice_payment(
          $1,
          $2,
          $3::numeric,
          $4::public.invoice_payment_method,
          COALESCE($5::timestamptz, now()),
          $6,
          $7
        ) AS id
      `,
      [
        invoiceId,
        input.companyId,
        input.amount,
        input.method,
        input.paidAt ?? null,
        input.reference ?? null,
        input.notes ?? null
      ]
    );

    const paymentId = createResult.rows[0]?.id;
    if (!paymentId) return null;

    const [paymentResult, invoiceResult] = await Promise.all([
      client.query(
        `
          ${paymentDetailsSql}
          WHERE payment.id = $1
            AND payment.invoice_id = $2
            AND payment.company_id = $3
          LIMIT 1
        `,
        [paymentId, invoiceId, input.companyId]
      ),
      client.query(
        `
          ${invoiceDetailsSql}
          WHERE invoice.id = $1 AND invoice.company_id = $2
          LIMIT 1
        `,
        [invoiceId, input.companyId]
      )
    ]);

    return {
      payment: paymentResult.rows[0] ?? null,
      invoice: invoiceResult.rows[0] ?? null
    };
  });
}

export async function reverseInvoicePaymentRepo(
  userId: string,
  invoiceId: string,
  paymentId: string,
  input: ReverseInvoicePaymentInput
) {
  return withUserTransaction(userId, async (client) => {
    const reverseResult = await client.query<{ id: string | null }>(
      `
        SELECT public.reverse_invoice_payment(
          $1,
          $2,
          $3,
          $4
        ) AS id
      `,
      [paymentId, invoiceId, input.companyId, input.reason]
    );

    const reversedPaymentId = reverseResult.rows[0]?.id;
    if (!reversedPaymentId) return null;

    const [paymentResult, invoiceResult] = await Promise.all([
      client.query(
        `
          ${paymentDetailsSql}
          WHERE payment.id = $1
            AND payment.invoice_id = $2
            AND payment.company_id = $3
          LIMIT 1
        `,
        [reversedPaymentId, invoiceId, input.companyId]
      ),
      client.query(
        `
          ${invoiceDetailsSql}
          WHERE invoice.id = $1 AND invoice.company_id = $2
          LIMIT 1
        `,
        [invoiceId, input.companyId]
      )
    ]);

    return {
      payment: paymentResult.rows[0] ?? null,
      invoice: invoiceResult.rows[0] ?? null
    };
  });
}

export async function cancelInvoiceRepo(
  userId: string,
  invoiceId: string,
  input: CancelInvoiceInput
) {
  return withUserTransaction(userId, async (client) => {
    const cancelResult = await client.query<{ id: string | null }>(
      `SELECT public.cancel_invoice($1, $2, $3) AS id`,
      [invoiceId, input.companyId, input.reason]
    );

    const cancelledInvoiceId = cancelResult.rows[0]?.id;
    if (!cancelledInvoiceId) return null;

    const result = await client.query(
      `
        ${invoiceDetailsSql}
        WHERE invoice.id = $1 AND invoice.company_id = $2
        LIMIT 1
      `,
      [cancelledInvoiceId, input.companyId]
    );

    return result.rows[0] ?? null;
  });
}

export async function issueInvoiceCreditNoteRepo(
  userId: string,
  invoiceId: string,
  input: CreateInvoiceCreditNoteInput
) {
  return withUserTransaction(userId, async (client) => {
    const createResult = await client.query<{ id: string | null }>(
      `
        SELECT public.issue_invoice_credit_note(
          $1,
          $2,
          $3::numeric,
          $4
        ) AS id
      `,
      [invoiceId, input.companyId, input.amount, input.reason]
    );

    const creditNoteId = createResult.rows[0]?.id;
    if (!creditNoteId) return null;

    const [creditNoteResult, invoiceResult] = await Promise.all([
      client.query(
        `
          ${creditNoteDetailsSql}
          WHERE credit_note.id = $1
            AND credit_note.invoice_id = $2
            AND credit_note.company_id = $3
          LIMIT 1
        `,
        [creditNoteId, invoiceId, input.companyId]
      ),
      client.query(
        `
          ${invoiceDetailsSql}
          WHERE invoice.id = $1 AND invoice.company_id = $2
          LIMIT 1
        `,
        [invoiceId, input.companyId]
      )
    ]);

    return {
      creditNote: creditNoteResult.rows[0] ?? null,
      invoice: invoiceResult.rows[0] ?? null
    };
  });
}

export async function cancelInvoiceCreditNoteRepo(
  userId: string,
  invoiceId: string,
  creditNoteId: string,
  input: CancelInvoiceCreditNoteInput
) {
  return withUserTransaction(userId, async (client) => {
    const cancelResult = await client.query<{ id: string | null }>(
      `
        SELECT public.cancel_invoice_credit_note(
          $1,
          $2,
          $3,
          $4
        ) AS id
      `,
      [creditNoteId, invoiceId, input.companyId, input.reason]
    );

    const cancelledCreditNoteId = cancelResult.rows[0]?.id;
    if (!cancelledCreditNoteId) return null;

    const [creditNoteResult, invoiceResult] = await Promise.all([
      client.query(
        `
          ${creditNoteDetailsSql}
          WHERE credit_note.id = $1
            AND credit_note.invoice_id = $2
            AND credit_note.company_id = $3
          LIMIT 1
        `,
        [cancelledCreditNoteId, invoiceId, input.companyId]
      ),
      client.query(
        `
          ${invoiceDetailsSql}
          WHERE invoice.id = $1 AND invoice.company_id = $2
          LIMIT 1
        `,
        [invoiceId, input.companyId]
      )
    ]);

    return {
      creditNote: creditNoteResult.rows[0] ?? null,
      invoice: invoiceResult.rows[0] ?? null
    };
  });
}
