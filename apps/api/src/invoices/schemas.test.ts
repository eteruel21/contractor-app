import assert from "node:assert/strict";
import { test } from "vitest";

import {
  cancelInvoiceSchema,
  cancelInvoiceCreditNoteSchema,
  createInvoicePaymentSchema,
  createInvoiceCreditNoteSchema,
  invoiceActionSchema,
  invoiceStatusSchema,
  reverseInvoicePaymentSchema
} from "./schemas.js";

const companyId = "00000000-0000-4000-8000-000000000001";

test("acepta la acción de emisión con una empresa válida", () => {
  assert.equal(
    invoiceActionSchema.safeParse({ companyId }).success,
    true
  );
});

test("la cancelación de factura exige un motivo", () => {
  assert.equal(
    cancelInvoiceSchema.safeParse({ companyId, reason: "No" }).success,
    false
  );

  assert.equal(
    cancelInvoiceSchema.safeParse({
      companyId,
      reason: "Duplicada por error."
    }).success,
    true
  );
});

test("rechaza estados de pago manuales", () => {
  for (const status of [
    "draft",
    "issued",
    "partially_paid",
    "paid",
    "cancelled"
  ]) {
    assert.equal(
      invoiceStatusSchema.safeParse({
        companyId,
        status,
        reason: "Cambio manual"
      }).success,
      false
    );
  }

  assert.equal(
    invoiceStatusSchema.safeParse({
      companyId,
      status: "overdue"
    }).success,
    true
  );
});

test("acepta un abono válido con dos decimales", () => {
  assert.equal(
    createInvoicePaymentSchema.safeParse({
      companyId,
      amount: 125.75,
      method: "bank_transfer",
      reference: "ACH-123"
    }).success,
    true
  );
});

test("rechaza abonos inválidos", () => {
  for (const amount of [0, -10, 10.001]) {
    assert.equal(
      createInvoicePaymentSchema.safeParse({
        companyId,
        amount,
        method: "cash"
      }).success,
      false
    );
  }

  assert.equal(
    createInvoicePaymentSchema.safeParse({
      companyId,
      amount: 10,
      method: "crypto"
    }).success,
    false
  );
});

test("la reversión de pago exige un motivo", () => {
  assert.equal(
    reverseInvoicePaymentSchema.safeParse({
      companyId,
      reason: "No"
    }).success,
    false
  );

  assert.equal(
    reverseInvoicePaymentSchema.safeParse({
      companyId,
      reason: "Transferencia duplicada."
    }).success,
    true
  );
});

test("acepta una nota de crédito válida", () => {
  assert.equal(
    createInvoiceCreditNoteSchema.safeParse({
      companyId,
      amount: 75.25,
      reason: "Corrección parcial del alcance."
    }).success,
    true
  );
});

test("rechaza notas de crédito inválidas", () => {
  for (const amount of [0, -1, 10.001]) {
    assert.equal(
      createInvoiceCreditNoteSchema.safeParse({
        companyId,
        amount,
        reason: "Corrección válida."
      }).success,
      false
    );
  }
});

test("la cancelación de nota de crédito exige un motivo", () => {
  assert.equal(
    cancelInvoiceCreditNoteSchema.safeParse({
      companyId,
      reason: "No"
    }).success,
    false
  );

  assert.equal(
    cancelInvoiceCreditNoteSchema.safeParse({
      companyId,
      reason: "Nota emitida por duplicado."
    }).success,
    true
  );
});
