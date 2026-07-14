import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { formatMoney, type BudgetItem, type BudgetSection } from "@/types/budget";
import { getClientDisplayName } from "@/types/client";
import type { Company } from "@/types/company";
import { formatShortDate } from "@/utils/format";
import type { InvoiceWithDetails } from "@/types/invoice";

type InvoicePdfInput = {
  company: Company;
  invoice: InvoiceWithDetails;
};

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string | null | undefined, timezone?: string) {
  if (!value) return "No definido";
  return formatShortDate(value, timezone);
}

function renderItems(
  section: BudgetSection | null,
  items: BudgetItem[],
  currencyCode?: string,
) {
  const sectionName = section?.name ?? "Sin sección";

  if (items.length === 0) {
    return "";
  }

  return `
    <tr>
      <td colspan="5" class="section-title">
        ${escapeHtml(sectionName)}
      </td>
    </tr>

    ${items
      .map(
        (item) => `
          <tr>
            <td>
              <strong>${escapeHtml(item.description)}</strong>
              ${
                item.notes
                  ? `<div class="item-note">${escapeHtml(item.notes)}</div>`
                  : ""
              }
            </td>
            <td class="center">
              ${escapeHtml(item.unit_name)}
            </td>
            <td class="right">
              ${Number(item.quantity).toLocaleString("es-PA")}
            </td>
            <td class="right">
              ${formatMoney(item.unit_price, currencyCode)}
            </td>
            <td class="right strong">
              ${formatMoney(item.subtotal, currencyCode)}
            </td>
          </tr>
        `,
      )
      .join("")}
  `;
}

export function buildInvoiceHtml({
  company,
  invoice,
}: InvoicePdfInput) {
  const clientName = invoice.client
    ? getClientDisplayName(invoice.client)
    : "Cliente no registrado";

  const clientAddress = invoice.budget?.address?.address ?? "Sin dirección registrada";

  const budget = invoice.budget;

  let itemsHtml = "";
  let subtotal = 0;
  let taxAmount = 0;
  let total = 0;
  let currencyCode = company.currency_code || "USD";

  if (budget) {
    currencyCode = budget.currency_code;
    subtotal = budget.subtotal;
    taxAmount = budget.tax_amount;
    total = budget.total;

    const sectionsHtml = budget.sections
      .map((section) => {
        const items = budget.items.filter(
          (item) => item.section_id === section.id,
        );
        return renderItems(section, items, budget.currency_code);
      })
      .join("");

    const orphanItems = budget.items.filter(
      (item) => !item.section_id,
    );

    const orphanHtml =
      orphanItems.length > 0
        ? renderItems(null, orphanItems, budget.currency_code)
        : "";

    itemsHtml = sectionsHtml + orphanHtml;
  } else {
    itemsHtml = `
      <tr>
        <td colspan="5" class="empty-row">
          No hay partidas vinculadas a esta factura.
        </td>
      </tr>
    `;
  }

  const logoHtml = company.logo_url
    ? `<img src="${escapeHtml(company.logo_url)}" class="company-logo" alt="Logo" />`
    : "";

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 32px;
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 3px solid #169b62;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }

    .company-logo {
      max-height: 60px;
      max-width: 180px;
      margin-bottom: 10px;
      display: block;
    }

    .company-name {
      font-size: 24px;
      font-weight: 800;
      color: #10251d;
      margin-bottom: 5px;
    }

    .company-meta {
      color: #475569;
      line-height: 1.5;
    }

    .doc-box {
      min-width: 210px;
      padding: 16px;
      border-radius: 12px;
      background: #f1f5f9;
      text-align: right;
    }

    .doc-label {
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .doc-number {
      margin-top: 5px;
      font-size: 22px;
      font-weight: 900;
      color: #169b62;
    }

    .status {
      margin-top: 6px;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 22px;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      background: #ffffff;
    }

    .card-title {
      font-size: 12px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .main-text {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .muted {
      color: #475569;
      line-height: 1.45;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
    }

    th {
      background: #10251d;
      color: #ffffff;
      text-align: left;
      font-size: 11px;
      padding: 10px 8px;
    }

    td {
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 8px;
      vertical-align: top;
    }

    .section-title {
      background: #ddf7ea;
      color: #0b4d3a;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .item-note {
      margin-top: 4px;
      font-size: 11px;
      color: #64748b;
      font-style: italic;
    }

    .right {
      text-align: right;
    }

    .center {
      text-align: center;
    }

    .strong {
      font-weight: 700;
    }

    .totals-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 22px;
    }

    .totals-box {
      width: 250px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #475569;
    }

    .total-row.grand-total {
      border-top: 2px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 4px;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .footer {
      margin-top: 45px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      color: #64748b;
      text-align: center;
      font-size: 11px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${logoHtml}
      <div class="company-name">${escapeHtml(company.legal_name || company.name)}</div>
      <div class="company-meta">
        ${company.tax_id ? `RUC / ID: ${escapeHtml(company.tax_id)}<br/>` : ""}
        ${company.address ? `${escapeHtml(company.address)}<br/>` : ""}
        ${company.phone ? `Telf: ${escapeHtml(company.phone)} ` : ""}
        ${company.email ? `· Correo: ${escapeHtml(company.email)}` : ""}
      </div>
    </div>

    <div class="doc-box">
      <div class="doc-label">Factura</div>
      <div class="doc-number">${escapeHtml(invoice.invoice_number)}</div>
      <div class="status">Estado: ${escapeHtml(invoice.status === "paid" ? "Pagada" : invoice.status === "cancelled" ? "Cancelada" : "Pendiente")}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Facturado a</div>
      <div class="main-text">${escapeHtml(clientName)}</div>
      <div class="muted">
        Dirección: ${escapeHtml(clientAddress)}<br/>
        ${invoice.client?.phone ? `Telf: ${escapeHtml(invoice.client.phone)}<br/>` : ""}
        ${invoice.client?.email ? `Correo: ${escapeHtml(invoice.client.email)}` : ""}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Detalles de Factura</div>
      <div class="muted">
        <strong>Fecha de emisión:</strong> ${formatDate(invoice.issue_date, company.timezone)}<br/>
        <strong>Fecha de vencimiento:</strong> ${invoice.due_date ? formatDate(invoice.due_date, company.timezone) : "Pago de contado"}<br/>
        ${budget ? `<strong>Presupuesto ref:</strong> ${escapeHtml(budget.budget_number)}` : ""}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Descripción</th>
        <th style="width: 10%;" class="center">Unidad</th>
        <th style="width: 12%;" class="right">Cant.</th>
        <th style="width: 13%;" class="right">P. Unitario</th>
        <th style="width: 15%;" class="right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals-container">
    <div class="totals-box">
      <div class="total-row">
        <span>Subtotal:</span>
        <span class="strong">${formatMoney(subtotal, currencyCode)}</span>
      </div>
      <div class="total-row">
        <span>ITBMS/IVA (${company.tax_rate}%):</span>
        <span class="strong">${formatMoney(taxAmount, currencyCode)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>${formatMoney(total, currencyCode)}</span>
      </div>
    </div>
  </div>

  ${
    invoice.notes
      ? `
    <div style="margin-top: 24px;">
      <div class="card-title">Notas / Condiciones</div>
      <div class="muted" style="white-space: pre-line;">${escapeHtml(invoice.notes)}</div>
    </div>
    `
      : ""
  }

  <div class="footer">
    ¡Gracias por su preferencia!<br/>
    Si tiene alguna duda sobre esta factura, por favor contáctenos.
  </div>
</body>
</html>
  `;
}

export async function shareInvoicePdf({
  company,
  invoice,
}: InvoicePdfInput): Promise<{
  error: string | null;
}> {
  try {
    const html = buildInvoiceHtml({ company, invoice });
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Compartir factura ${invoice.invoice_number}`,
      UTI: "com.adobe.pdf",
    });
    return { error: null };
  } catch (error: any) {
    return { error: error?.message ?? "Error desconocido" };
  }
}
