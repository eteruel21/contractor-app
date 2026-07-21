import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { formatMoney } from "@/types/budget";
import { formatShortDate } from "@/utils/format";
import {
  getInvoiceStatusLabel,
  type InvoiceSnapshot,
  type InvoiceWithDetails
} from "@/types/invoice";

type InvoicePdfInput = {
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
  section: InvoiceSnapshot["sections"][number] | null,
  items: InvoiceSnapshot["items"],
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
              ${escapeHtml(item.unitName)}
            </td>
            <td class="right">
              ${Number(item.quantity).toLocaleString("es-PA")}
            </td>
            <td class="right">
              ${formatMoney(item.unitPrice, currencyCode)}
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
  invoice,
}: InvoicePdfInput) {
  const snapshot = invoice.snapshot_data;

  if (!snapshot || invoice.status === "draft") {
    throw new Error(
      "La factura debe estar emitida y tener un snapshot válido antes de generar el PDF."
    );
  }

  const company = snapshot.company;
  const client = snapshot.client;
  const invoiceData = snapshot.invoice;
  const clientName =
    client.businessName?.trim() ||
    [client.firstName, client.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Cliente no registrado";
  const clientAddressValue = client.address?.address;
  const clientAddress =
    typeof clientAddressValue === "string" && clientAddressValue.trim()
      ? clientAddressValue
      : "Sin dirección registrada";
  const currencyCode = snapshot.currency || "USD";
  const sectionIds = new Set(snapshot.sections.map((section) => section.id));
  const sectionsHtml = snapshot.sections
    .map((section) => {
      const items = snapshot.items.filter(
        (item) => item.sectionId === section.id
      );
      return renderItems(section, items, currencyCode);
    })
    .join("");
  const orphanItems = snapshot.items.filter(
    (item) => !item.sectionId || !sectionIds.has(item.sectionId)
  );
  const orphanHtml = orphanItems.length
    ? renderItems(null, orphanItems, currencyCode)
    : "";
  const itemsHtml = sectionsHtml || orphanHtml
    ? sectionsHtml + orphanHtml
    : `
        <tr>
          <td colspan="5" class="empty-row">
            No hay partidas registradas en esta factura.
          </td>
        </tr>
      `;
  const primaryTax = snapshot.taxes[0];
  const notesAndConditions = [
    invoiceData.notes,
    snapshot.conditions
  ].filter(Boolean).join("\n\n");

  const logoHtml = company.logoUrl
    ? `<img src="${escapeHtml(company.logoUrl)}" class="company-logo" alt="Logo" />`
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
      <div class="company-name">${escapeHtml(company.legalName || company.name)}</div>
      <div class="company-meta">
        ${company.taxId ? `RUC / ID: ${escapeHtml(company.taxId)}<br/>` : ""}
        ${company.address ? `${escapeHtml(company.address)}<br/>` : ""}
        ${company.phone ? `Telf: ${escapeHtml(company.phone)} ` : ""}
        ${company.email ? `· Correo: ${escapeHtml(company.email)}` : ""}
      </div>
    </div>

    <div class="doc-box">
      <div class="doc-label">Factura</div>
      <div class="doc-number">${escapeHtml(invoiceData.number)}</div>
      <div class="status">Estado: ${escapeHtml(getInvoiceStatusLabel(invoice.status))}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Facturado a</div>
      <div class="main-text">${escapeHtml(clientName)}</div>
      <div class="muted">
        Dirección: ${escapeHtml(clientAddress)}<br/>
        ${client.phone ? `Telf: ${escapeHtml(client.phone)}<br/>` : ""}
        ${client.email ? `Correo: ${escapeHtml(client.email)}` : ""}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Detalles de Factura</div>
      <div class="muted">
        <strong>Fecha de emisión:</strong> ${formatDate(invoiceData.issueDate, company.timezone)}<br/>
        <strong>Fecha de vencimiento:</strong> ${invoiceData.dueDate ? formatDate(invoiceData.dueDate, company.timezone) : "Pago de contado"}<br/>
        <strong>Presupuesto ref:</strong> ${escapeHtml(snapshot.source.budgetNumber)}
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
        <span class="strong">${formatMoney(snapshot.totals.subtotal, currencyCode)}</span>
      </div>
      <div class="total-row">
        <span>ITBMS/IVA (${primaryTax?.rate ?? 0}%):</span>
        <span class="strong">${formatMoney(snapshot.totals.tax, currencyCode)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>${formatMoney(snapshot.totals.total, currencyCode)}</span>
      </div>
    </div>
  </div>

  ${
    notesAndConditions
      ? `
    <div style="margin-top: 24px;">
      <div class="card-title">Notas / Condiciones</div>
      <div class="muted" style="white-space: pre-line;">${escapeHtml(notesAndConditions)}</div>
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
  invoice,
}: InvoicePdfInput): Promise<{
  error: string | null;
}> {
  try {
    const html = buildInvoiceHtml({ invoice });
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Compartir factura ${invoice.snapshot_data?.invoice.number ?? "sin número"}`,
      UTI: "com.adobe.pdf",
    });
    return { error: null };
  } catch (error: any) {
    return { error: error?.message ?? "Error desconocido" };
  }
}
