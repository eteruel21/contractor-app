import { safeErrorDetails } from "../security/redaction.js";
import { sendPushNotificationToUser } from "./push-service.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object"
    ? value as UnknownRecord
    : null;
}

function textField(record: UnknownRecord | null, field: string): string | null {
  const value = record?.[field];
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

async function dispatchEventPush(
  recipientUserId: string | null,
  title: string,
  body: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!recipientUserId) return;

  try {
    await sendPushNotificationToUser(recipientUserId, {
      title,
      body,
      data
    });
  } catch (error) {
    // El evento de negocio ya fue confirmado. Push es un efecto secundario
    // best-effort y nunca debe convertir la operación principal en un error.
    console.error(
      "No se pudo enviar la notificación push del evento:",
      safeErrorDetails(error)
    );
  }
}

export async function notifyBudgetDecision(
  budgetValue: unknown,
  decision: "approved" | "rejected"
): Promise<void> {
  const budget = asRecord(budgetValue);
  const recipientUserId = textField(budget, "created_by");
  const budgetId = textField(budget, "id");
  const companyId = textField(budget, "company_id");
  const budgetNumber = textField(budget, "budget_number");
  const displayNumber = budgetNumber ? ` ${budgetNumber}` : "";
  const approved = decision === "approved";

  await dispatchEventPush(
    recipientUserId,
    approved ? "Presupuesto aprobado" : "Presupuesto rechazado",
    approved
      ? `El cliente aprobó el presupuesto${displayNumber}.`
      : `El cliente rechazó el presupuesto${displayNumber}.`,
    {
      type: approved ? "budget.approved" : "budget.rejected",
      ...(budgetId ? { budgetId } : {}),
      ...(companyId ? { companyId } : {})
    }
  );
}

export async function notifyInvoiceIssued(invoiceValue: unknown): Promise<void> {
  const invoice = asRecord(invoiceValue);
  const client = asRecord(invoice?.client);
  const recipientUserId = textField(client, "user_id");
  const invoiceId = textField(invoice, "id");
  const companyId = textField(invoice, "company_id");
  const invoiceNumber = textField(invoice, "invoice_number");
  const displayNumber = invoiceNumber ? ` ${invoiceNumber}` : "";

  await dispatchEventPush(
    recipientUserId,
    "Factura emitida",
    `Se emitió la factura${displayNumber}.`,
    {
      type: "invoice.issued",
      ...(invoiceId ? { invoiceId } : {}),
      ...(companyId ? { companyId } : {})
    }
  );
}

export async function notifyInvoicePaymentRegistered(
  invoiceValue: unknown,
  paymentValue: unknown
): Promise<void> {
  const invoice = asRecord(invoiceValue);
  const payment = asRecord(paymentValue);
  const client = asRecord(invoice?.client);
  const recipientUserId = textField(client, "user_id");
  const invoiceId = textField(invoice, "id");
  const companyId = textField(invoice, "company_id");
  const invoiceNumber = textField(invoice, "invoice_number");
  const paymentId = textField(payment, "id");
  const displayNumber = invoiceNumber ? ` ${invoiceNumber}` : "";

  await dispatchEventPush(
    recipientUserId,
    "Pago registrado",
    `Se registró un pago para la factura${displayNumber}.`,
    {
      type: "invoice.payment_registered",
      ...(invoiceId ? { invoiceId } : {}),
      ...(paymentId ? { paymentId } : {}),
      ...(companyId ? { companyId } : {})
    }
  );
}
