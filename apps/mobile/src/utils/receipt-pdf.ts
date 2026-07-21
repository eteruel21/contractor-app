import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { formatMoney } from "@/types/budget";
import {
  getInvoicePaymentMethodLabel,
  type InvoicePayment
} from "@/types/invoice";
import { formatShortDate } from "@/utils/format";

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildReceiptHtml(payment: InvoicePayment): string {
  const snapshot = payment.receipt_snapshot_data;
  const company = snapshot.company;
  const client = snapshot.client;
  const currency = snapshot.payment.currency || payment.currency_code;
  const clientName =
    client.businessName?.trim() ||
    [client.firstName, client.lastName].filter(Boolean).join(" ").trim() ||
    "Cliente no registrado";
  const reversed = payment.status === "reversed";

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 26px; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Arial, Helvetica, sans-serif;
      color: #14231c;
      background: #ffffff;
      font-size: 12px;
    }
    .receipt {
      max-width: 680px;
      margin: 0 auto;
      border: 1px solid #dde6e0;
      border-radius: 18px;
      overflow: hidden;
    }
    .header {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      gap: 20px;
      color: #ffffff;
      background: #10251d;
    }
    .company { font-size: 21px; font-weight: 900; }
    .meta { margin-top: 5px; color: #b7c9c0; line-height: 1.5; }
    .number { text-align: right; }
    .number-label { color: #b7c9c0; font-size: 10px; text-transform: uppercase; }
    .number-value { margin-top: 5px; color: #50d695; font-size: 21px; font-weight: 900; }
    .body { padding: 24px; }
    .paid-label { color: #637168; text-align: center; text-transform: uppercase; font-weight: 800; }
    .amount { margin-top: 8px; color: #169b62; text-align: center; font-size: 36px; font-weight: 900; }
    .grid { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card { padding: 14px; border: 1px solid #dde6e0; border-radius: 12px; }
    .card-title { color: #637168; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .card-value { margin-top: 6px; font-size: 14px; font-weight: 800; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #edf2ef; }
    .totals { margin-top: 22px; }
    .balance { padding-top: 10px; border-top: 2px solid #dde6e0; font-size: 15px; font-weight: 900; }
    .void {
      margin: 18px 24px 0;
      padding: 10px;
      border: 2px solid #d64545;
      color: #d64545;
      text-align: center;
      font-size: 18px;
      font-weight: 900;
      transform: rotate(-2deg);
    }
    .footer { padding: 18px 24px; color: #637168; text-align: center; background: #f4f7f5; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div>
        <div class="company">${escapeHtml(company.legalName || company.name)}</div>
        <div class="meta">
          ${company.taxId ? `RUC / ID: ${escapeHtml(company.taxId)}<br/>` : ""}
          ${company.phone ? `${escapeHtml(company.phone)}<br/>` : ""}
          ${company.email ? escapeHtml(company.email) : ""}
        </div>
      </div>
      <div class="number">
        <div class="number-label">Recibo de pago</div>
        <div class="number-value">${escapeHtml(snapshot.receipt.number)}</div>
      </div>
    </div>
    ${reversed ? `<div class="void">RECIBO REVERTIDO</div>` : ""}
    <div class="body">
      <div class="paid-label">Monto recibido</div>
      <div class="amount">${formatMoney(snapshot.payment.amount, currency)}</div>

      <div class="grid">
        <div class="card">
          <div class="card-title">Recibido de</div>
          <div class="card-value">${escapeHtml(clientName)}</div>
          ${client.documentNumber ? `<div class="meta">ID: ${escapeHtml(client.documentNumber)}</div>` : ""}
        </div>
        <div class="card">
          <div class="card-title">Aplicado a factura</div>
          <div class="card-value">${escapeHtml(snapshot.invoice.number)}</div>
          <div class="meta">Pago ${escapeHtml(snapshot.payment.number)}</div>
        </div>
        <div class="card">
          <div class="card-title">Fecha</div>
          <div class="card-value">${formatShortDate(snapshot.payment.paidAt, company.timezone)}</div>
        </div>
        <div class="card">
          <div class="card-title">Método</div>
          <div class="card-value">${escapeHtml(getInvoicePaymentMethodLabel(snapshot.payment.method))}</div>
          ${snapshot.payment.reference ? `<div class="meta">Ref: ${escapeHtml(snapshot.payment.reference)}</div>` : ""}
        </div>
      </div>

      <div class="totals">
        <div class="row"><span>Total de factura</span><strong>${formatMoney(snapshot.invoice.total, currency)}</strong></div>
        ${snapshot.totals.creditTotal ? `<div class="row"><span>Notas de crédito aplicadas</span><strong>− ${formatMoney(snapshot.totals.creditTotal, currency)}</strong></div>` : ""}
        ${snapshot.totals.adjustedInvoiceTotal !== undefined ? `<div class="row"><span>Total ajustado</span><strong>${formatMoney(snapshot.totals.adjustedInvoiceTotal, currency)}</strong></div>` : ""}
        <div class="row"><span>Pagado anteriormente</span><strong>${formatMoney(snapshot.totals.previousPaid, currency)}</strong></div>
        <div class="row"><span>Total pagado</span><strong>${formatMoney(snapshot.totals.totalPaid, currency)}</strong></div>
        <div class="row balance"><span>Saldo pendiente</span><span>${formatMoney(snapshot.totals.balance, currency)}</span></div>
      </div>

      ${snapshot.payment.notes ? `<div class="card" style="margin-top: 18px;"><div class="card-title">Notas</div><div class="card-value">${escapeHtml(snapshot.payment.notes)}</div></div>` : ""}
      ${reversed && payment.reversal_reason ? `<div class="card" style="margin-top: 12px;"><div class="card-title">Motivo de reversión</div><div class="card-value">${escapeHtml(payment.reversal_reason)}</div></div>` : ""}
    </div>
    <div class="footer">Este recibo fue generado desde el registro inmutable del pago.</div>
  </div>
</body>
</html>
  `;
}

export async function shareReceiptPdf(payment: InvoicePayment): Promise<{
  error: string | null;
}> {
  try {
    const html = buildReceiptHtml(payment);
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Compartir recibo ${payment.receipt_number}`,
      UTI: "com.adobe.pdf",
    });
    return { error: null };
  } catch (error: any) {
    return {
      error: error?.message ?? "No fue posible generar el recibo."
    };
  }
}
