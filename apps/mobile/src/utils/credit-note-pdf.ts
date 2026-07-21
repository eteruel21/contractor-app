import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { formatMoney } from "@/types/budget";
import type { InvoiceCreditNote } from "@/types/invoice";
import { formatShortDate } from "@/utils/format";

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildCreditNoteHtml(creditNote: InvoiceCreditNote): string {
  const snapshot = creditNote.snapshot_data;
  const company = snapshot.company;
  const client = snapshot.client;
  const currency = snapshot.creditNote.currency || creditNote.currency_code;
  const clientName =
    client.businessName?.trim()
    || [client.firstName, client.lastName].filter(Boolean).join(" ").trim()
    || "Cliente no registrado";
  const cancelled = creditNote.status === "cancelled";

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 26px; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font-family: Arial, sans-serif; color: #14231c; font-size: 12px; }
    .document { max-width: 720px; margin: 0 auto; border: 1px solid #dde6e0; border-radius: 18px; overflow: hidden; }
    .header { padding: 24px; display: flex; justify-content: space-between; gap: 20px; color: #fff; background: #10251d; }
    .company { font-size: 21px; font-weight: 900; }
    .meta { margin-top: 5px; color: #b7c9c0; line-height: 1.5; }
    .number { text-align: right; }
    .number-label { color: #b7c9c0; font-size: 10px; text-transform: uppercase; }
    .number-value { margin-top: 5px; color: #50d695; font-size: 21px; font-weight: 900; }
    .void { margin: 18px 24px 0; padding: 10px; border: 2px solid #d64545; color: #d64545; text-align: center; font-size: 18px; font-weight: 900; }
    .body { padding: 24px; }
    .amount-label { color: #637168; text-align: center; text-transform: uppercase; font-weight: 800; }
    .amount { margin-top: 8px; color: #169b62; text-align: center; font-size: 36px; font-weight: 900; }
    .grid { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card { padding: 14px; border: 1px solid #dde6e0; border-radius: 12px; }
    .card-title { color: #637168; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .card-value { margin-top: 6px; font-size: 14px; font-weight: 800; }
    .totals { margin-top: 22px; }
    .row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #edf2ef; }
    .balance { padding-top: 10px; border-top: 2px solid #dde6e0; font-size: 15px; font-weight: 900; }
    .footer { padding: 18px 24px; color: #637168; text-align: center; background: #f4f7f5; }
  </style>
</head>
<body>
  <div class="document">
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
        <div class="number-label">Nota de crédito</div>
        <div class="number-value">${escapeHtml(snapshot.creditNote.number)}</div>
      </div>
    </div>
    ${cancelled ? `<div class="void">NOTA DE CRÉDITO CANCELADA</div>` : ""}
    <div class="body">
      <div class="amount-label">Monto acreditado</div>
      <div class="amount">${formatMoney(snapshot.creditNote.amount, currency)}</div>

      <div class="grid">
        <div class="card">
          <div class="card-title">Cliente</div>
          <div class="card-value">${escapeHtml(clientName)}</div>
          ${client.documentNumber ? `<div class="meta">ID: ${escapeHtml(client.documentNumber)}</div>` : ""}
        </div>
        <div class="card">
          <div class="card-title">Factura corregida</div>
          <div class="card-value">${escapeHtml(snapshot.invoice.number)}</div>
          <div class="meta">Emitida: ${formatShortDate(snapshot.invoice.issueDate, company.timezone)}</div>
        </div>
        <div class="card">
          <div class="card-title">Fecha de la nota</div>
          <div class="card-value">${formatShortDate(snapshot.creditNote.issuedAt, company.timezone)}</div>
        </div>
        <div class="card">
          <div class="card-title">Motivo</div>
          <div class="card-value">${escapeHtml(snapshot.creditNote.reason)}</div>
        </div>
      </div>

      <div class="totals">
        <div class="row"><span>Total original de factura</span><strong>${formatMoney(snapshot.invoice.total, currency)}</strong></div>
        <div class="row"><span>Crédito acumulado</span><strong>− ${formatMoney(snapshot.totals.totalCredit, currency)}</strong></div>
        <div class="row"><span>Total ajustado</span><strong>${formatMoney(snapshot.totals.adjustedInvoiceTotal, currency)}</strong></div>
        <div class="row"><span>Pagado</span><strong>${formatMoney(snapshot.totals.totalPaid, currency)}</strong></div>
        <div class="row balance"><span>Saldo pendiente</span><span>${formatMoney(snapshot.totals.balance, currency)}</span></div>
        ${snapshot.totals.customerCredit > 0 ? `<div class="row"><span>Crédito a favor del cliente</span><strong>${formatMoney(snapshot.totals.customerCredit, currency)}</strong></div>` : ""}
      </div>

      ${cancelled && creditNote.cancellation_reason ? `<div class="card" style="margin-top: 18px;"><div class="card-title">Motivo de cancelación</div><div class="card-value">${escapeHtml(creditNote.cancellation_reason)}</div></div>` : ""}
    </div>
    <div class="footer">Documento generado desde el snapshot inmutable de la nota de crédito.</div>
  </div>
</body>
</html>
  `;
}

export async function shareCreditNotePdf(
  creditNote: InvoiceCreditNote
): Promise<{ error: string | null }> {
  try {
    const html = buildCreditNoteHtml(creditNote);
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Compartir nota de crédito ${creditNote.credit_note_number}`,
      UTI: "com.adobe.pdf"
    });
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error
        ? error.message
        : "No fue posible generar la nota de crédito."
    };
  }
}
