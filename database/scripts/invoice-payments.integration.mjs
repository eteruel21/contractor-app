import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import pg from "pg";

import { requireTestDatabaseUrl } from "./db-utils.mjs";

const { Client } = pg;
const client = new Client({
  connectionString: requireTestDatabaseUrl()
});

async function setRole(role, userId) {
  await client.query(`SET LOCAL ROLE ${role}`);
  await client.query(
    "SELECT set_config('app.user_id', $1, true)",
    [userId]
  );
}

async function expectDatabaseError(name, pattern, callback) {
  await client.query(`SAVEPOINT ${name}`);

  try {
    await callback();
    assert.fail(`La operaciÃ³n ${name} debÃ­a fallar.`);
  } catch (error) {
    assert.match(String(error?.message ?? error), pattern);
  } finally {
    await client.query(`ROLLBACK TO SAVEPOINT ${name}`);
    await client.query(`RELEASE SAVEPOINT ${name}`);
  }
}

try {
  await client.connect();
  await client.query("BEGIN");

  const userId = randomUUID();

  await setRole("contractor_owner", userId);
  await client.query(
    `
      INSERT INTO app_auth.users (
        id,
        email,
        email_confirmed_at,
        raw_user_meta_data
      )
      VALUES (
        $1,
        $2,
        now(),
        jsonb_build_object('full_name', 'Owner de prueba')
      )
    `,
    [userId, `invoice-test-${userId}@example.test`]
  );
  // La aprobación inicial pertenece al montaje privilegiado del test.
  await client.query("SELECT set_config('app.user_id', '', true)");
  await client.query(
    `
      UPDATE public.profiles
      SET
        active = true,
        approved_at = now(),
        terms_accepted = true
      WHERE id = $1
    `,
    [userId]
  );

  await setRole("contractor_api", userId);
  const companyId = (
    await client.query(
      `
        SELECT public.create_company(
          'Empresa de prueba',
          '6000-0000',
          'empresa@example.test'
        ) AS id
      `
    )
  ).rows[0]?.id;
  assert.ok(companyId);

  await setRole("contractor_owner", userId);
  const clientId = (
    await client.query(
      `
        INSERT INTO public.clients (
          company_id,
          client_type,
          first_name,
          last_name,
          phone,
          email,
          created_by
        )
        VALUES (
          $1,
          'person',
          'Cliente',
          'Prueba',
          '6000-1111',
          'cliente@example.test',
          $2
        )
        RETURNING id
      `,
      [companyId, userId]
    )
  ).rows[0]?.id;
  assert.ok(clientId);

  const addressId = (
    await client.query(
      `
        INSERT INTO public.client_addresses (
          company_id,
          client_id,
          label,
          address,
          is_primary
        )
        VALUES ($1, $2, 'Principal', 'Ciudad de PanamÃ¡', true)
        RETURNING id
      `,
      [companyId, clientId]
    )
  ).rows[0]?.id;
  assert.ok(addressId);

  const projectId = (
    await client.query(
      `
        INSERT INTO public.projects (
          company_id,
          client_id,
          address_id,
          project_code,
          name,
          created_by
        )
        VALUES ($1, $2, $3, 'PR-TEST', 'Proyecto de prueba', $4)
        RETURNING id
      `,
      [companyId, clientId, addressId, userId]
    )
  ).rows[0]?.id;
  assert.ok(projectId);

  const budgetId = (
    await client.query(
      `
        INSERT INTO public.budgets (
          company_id,
          client_id,
          project_id,
          budget_number,
          title,
          status,
          currency_code,
          subtotal,
          tax_rate,
          tax_amount,
          total,
          terms,
          created_by,
          approved_at
        )
        VALUES (
          $1,
          $2,
          $3,
          'COT-TEST',
          'Presupuesto de prueba',
          'approved',
          'USD',
          100,
          0,
          0,
          100,
          'Pago contra entrega.',
          $4,
          now()
        )
        RETURNING id
      `,
      [companyId, clientId, projectId, userId]
    )
  ).rows[0]?.id;
  assert.ok(budgetId);

  await setRole("contractor_api", userId);
  const invoiceId = (
    await client.query(
      `
        SELECT public.create_invoice(
          $1,
          $2,
          $3,
          NULL,
          'Factura de prueba'
        ) AS id
      `,
      [companyId, clientId, budgetId]
    )
  ).rows[0]?.id;
  assert.ok(invoiceId);

  await client.query(
    "SELECT public.issue_invoice($1, $2)",
    [invoiceId, companyId]
  );

  const firstPaymentId = (
    await client.query(
      `
        SELECT public.record_invoice_payment(
          $1,
          $2,
          40.00,
          'bank_transfer',
          now(),
          'ACH-001',
          'Primer abono'
        ) AS id
      `,
      [invoiceId, companyId]
    )
  ).rows[0]?.id;
  assert.ok(firstPaymentId);

  const partialState = (
    await client.query(
      `
        SELECT
          invoice.status,
          (invoice.snapshot_data #>> '{totals,total}')::numeric AS total,
          COALESCE(
            sum(payment.amount) FILTER (
              WHERE payment.status = 'confirmed'
            ),
            0
          ) AS paid
        FROM public.invoices AS invoice
        LEFT JOIN public.invoice_payments AS payment
          ON payment.invoice_id = invoice.id
        WHERE invoice.id = $1
        GROUP BY invoice.id
      `,
      [invoiceId]
    )
  ).rows[0];

  assert.equal(partialState.status, "partially_paid");
  assert.equal(Number(partialState.total), 100);
  assert.equal(Number(partialState.paid), 40);

  await expectDatabaseError(
    "overpayment_check",
    /excede el saldo pendiente/i,
    () => client.query(
      `
        SELECT public.record_invoice_payment(
          $1,
          $2,
          61.00,
          'cash',
          now(),
          NULL,
          NULL
        )
      `,
      [invoiceId, companyId]
    )
  );

  await expectDatabaseError(
    "payment_update_acl",
    /(?:permission denied|permiso denegado|se ha denegado el permiso)/i,
    () => client.query(
      "UPDATE public.invoice_payments SET amount = 1 WHERE id = $1",
      [firstPaymentId]
    )
  );

  await expectDatabaseError(
    "payment_delete_acl",
    /(?:permission denied|permiso denegado|se ha denegado el permiso)/i,
    () => client.query(
      "DELETE FROM public.invoice_payments WHERE id = $1",
      [firstPaymentId]
    )
  );

  const secondPaymentId = (
    await client.query(
      `
        SELECT public.record_invoice_payment(
          $1,
          $2,
          60.00,
          'cash',
          now(),
          NULL,
          'Pago final'
        ) AS id
      `,
      [invoiceId, companyId]
    )
  ).rows[0]?.id;
  assert.ok(secondPaymentId);

  const paidStatus = (
    await client.query(
      "SELECT status FROM public.invoices WHERE id = $1",
      [invoiceId]
    )
  ).rows[0]?.status;
  assert.equal(paidStatus, "paid");

  await client.query(
    `
      SELECT public.reverse_invoice_payment(
        $1,
        $2,
        $3,
        'Pago duplicado de prueba'
      )
    `,
    [secondPaymentId, invoiceId, companyId]
  );

  const finalState = (
    await client.query(
      `
        SELECT
          invoice.status,
          COALESCE(
            sum(payment.amount) FILTER (
              WHERE payment.status = 'confirmed'
            ),
            0
          ) AS paid,
          count(*) FILTER (
            WHERE payment.status = 'reversed'
          ) AS reversed_count,
          count(*) FILTER (
            WHERE payment.receipt_snapshot_data IS NOT NULL
          ) AS receipt_count
        FROM public.invoices AS invoice
        LEFT JOIN public.invoice_payments AS payment
          ON payment.invoice_id = invoice.id
        WHERE invoice.id = $1
        GROUP BY invoice.id
      `,
      [invoiceId]
    )
  ).rows[0];

  assert.equal(finalState.status, "partially_paid");
  assert.equal(Number(finalState.paid), 40);
  assert.equal(Number(finalState.reversed_count), 1);
  assert.equal(Number(finalState.receipt_count), 2);

  const receipt = (
    await client.query(
      `
        SELECT
          receipt_number,
          receipt_snapshot_data #>> '{totals,balance}' AS balance
        FROM public.invoice_payments
        WHERE id = $1
      `,
      [firstPaymentId]
    )
  ).rows[0];
  assert.match(receipt.receipt_number, /^REC-/);
  assert.equal(Number(receipt.balance), 60);

  const firstCreditNoteId = (
    await client.query(
      `
        SELECT public.issue_invoice_credit_note(
          $1,
          $2,
          20.00,
          'CorrecciÃ³n parcial de prueba'
        ) AS id
      `,
      [invoiceId, companyId]
    )
  ).rows[0]?.id;
  assert.ok(firstCreditNoteId);

  const partialCreditState = (
    await client.query(
      `
        SELECT
          invoice.status,
          (invoice.snapshot_data #>> '{totals,total}')::numeric
            - COALESCE(sum(credit_note.amount) FILTER (
              WHERE credit_note.status = 'issued'
            ), 0) AS adjusted_total
        FROM public.invoices AS invoice
        LEFT JOIN public.invoice_credit_notes AS credit_note
          ON credit_note.invoice_id = invoice.id
        WHERE invoice.id = $1
        GROUP BY invoice.id
      `,
      [invoiceId]
    )
  ).rows[0];
  assert.equal(partialCreditState.status, "partially_paid");
  assert.equal(Number(partialCreditState.adjusted_total), 80);

  await expectDatabaseError(
    "adjusted_overpayment_check",
    /excede el saldo pendiente/i,
    () => client.query(
      `
        SELECT public.record_invoice_payment(
          $1,
          $2,
          41.00,
          'cash',
          now(),
          NULL,
          NULL
        )
      `,
      [invoiceId, companyId]
    )
  );

  const secondCreditNoteId = (
    await client.query(
      `
        SELECT public.issue_invoice_credit_note(
          $1,
          $2,
          60.00,
          'Ajuste adicional de prueba'
        ) AS id
      `,
      [invoiceId, companyId]
    )
  ).rows[0]?.id;
  assert.ok(secondCreditNoteId);

  const creditedPaidStatus = (
    await client.query(
      "SELECT status FROM public.invoices WHERE id = $1",
      [invoiceId]
    )
  ).rows[0]?.status;
  assert.equal(creditedPaidStatus, "paid");

  await expectDatabaseError(
    "credit_note_update_acl",
    /(?:permission denied|permiso denegado|se ha denegado el permiso)/i,
    () => client.query(
      "UPDATE public.invoice_credit_notes SET amount = 1 WHERE id = $1",
      [firstCreditNoteId]
    )
  );

  await expectDatabaseError(
    "credit_note_delete_acl",
    /(?:permission denied|permiso denegado|se ha denegado el permiso)/i,
    () => client.query(
      "DELETE FROM public.invoice_credit_notes WHERE id = $1",
      [firstCreditNoteId]
    )
  );

  await client.query(
    `
      SELECT public.cancel_invoice_credit_note(
        $1,
        $2,
        $3,
        'Segunda nota emitida por error'
      )
    `,
    [secondCreditNoteId, invoiceId, companyId]
  );

  await client.query(
    `
      SELECT public.cancel_invoice_credit_note(
        $1,
        $2,
        $3,
        'Primera nota emitida por error'
      )
    `,
    [firstCreditNoteId, invoiceId, companyId]
  );

  await expectDatabaseError(
    "cancel_invoice_with_payment",
    /movimientos financieros/i,
    () => client.query(
      "SELECT public.cancel_invoice($1, $2, 'CancelaciÃ³n invÃ¡lida de prueba')",
      [invoiceId, companyId]
    )
  );

  await client.query(
    `
      SELECT public.reverse_invoice_payment(
        $1,
        $2,
        $3,
        'ReversiÃ³n para probar cancelaciÃ³n'
      )
    `,
    [firstPaymentId, invoiceId, companyId]
  );

  const fullCreditNoteId = (
    await client.query(
      `
        SELECT public.issue_invoice_credit_note(
          $1,
          $2,
          100.00,
          'CrÃ©dito total de prueba'
        ) AS id
      `,
      [invoiceId, companyId]
    )
  ).rows[0]?.id;
  assert.ok(fullCreditNoteId);

  const fullCreditStatus = (
    await client.query(
      "SELECT status FROM public.invoices WHERE id = $1",
      [invoiceId]
    )
  ).rows[0]?.status;
  assert.equal(fullCreditStatus, "cancelled");

  await client.query(
    `
      SELECT public.cancel_invoice_credit_note(
        $1,
        $2,
        $3,
        'Se restaura la factura de prueba'
      )
    `,
    [fullCreditNoteId, invoiceId, companyId]
  );

  const restoredStatus = (
    await client.query(
      "SELECT status FROM public.invoices WHERE id = $1",
      [invoiceId]
    )
  ).rows[0]?.status;
  assert.equal(restoredStatus, "issued");

  await client.query(
    "SELECT public.cancel_invoice($1, $2, 'Factura duplicada de prueba')",
    [invoiceId, companyId]
  );

  const cancelledStatus = (
    await client.query(
      "SELECT status FROM public.invoices WHERE id = $1",
      [invoiceId]
    )
  ).rows[0]?.status;
  assert.equal(cancelledStatus, "cancelled");

  const historyEvents = (
    await client.query(
      `
        SELECT event_type
        FROM public.invoice_history
        WHERE invoice_id = $1
      `,
      [invoiceId]
    )
  ).rows.map((row) => row.event_type);
  assert.ok(historyEvents.includes("payment_recorded"));
  assert.ok(historyEvents.includes("payment_reversed"));
  assert.ok(historyEvents.includes("credit_note_issued"));
  assert.ok(historyEvents.includes("credit_note_cancelled"));
  assert.ok(historyEvents.includes("cancelled"));

  await client.query("ROLLBACK");
  console.log(
    "Flujo de pagos, saldos, recibos, notas de crÃ©dito y cancelaciÃ³n verificado."
  );
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
