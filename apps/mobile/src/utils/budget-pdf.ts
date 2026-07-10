import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type {
  BudgetDraft,
  BudgetItem,
} from "./budget-storage";

export type BudgetTotals = {
  directCost: number;
  overhead: number;
  costWithOverhead: number;
  profit: number;
  saleBeforeDiscount: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(
  value: number,
  maximumFractionDigits = 3,
): string {
  return new Intl.NumberFormat("es-PA", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function createItemRows(
  items: BudgetItem[],
): string {
  return items
    .map((item, index) => {
      const total =
        item.quantity * item.unitPrice;

      return `
        <tr>
          <td class="number">${index + 1}</td>
          <td>
            <strong>${escapeHtml(
              item.description || "Partida",
            )}</strong>
            ${
              item.details
                ? `<div class="details">${escapeHtml(
                    item.details,
                  )}</div>`
                : ""
            }
          </td>
          <td class="right">
            ${formatNumber(item.quantity)}
          </td>
          <td>${escapeHtml(item.unit)}</td>
          <td class="right">
            ${formatMoney(item.unitPrice)}
          </td>
          <td class="right strong">
            ${formatMoney(total)}
          </td>
        </tr>
      `;
    })
    .join("");
}

export function createBudgetHtml(
  draft: BudgetDraft,
  totals: BudgetTotals,
): string {
  const safeTitle = escapeHtml(
    draft.title || "Presupuesto",
  );

  const safeClient = escapeHtml(
    draft.clientName || "Cliente no especificado",
  );

  const safeClientCompany = escapeHtml(
    draft.clientCompany || "",
  );

  const safeClientContact = escapeHtml(
    [draft.clientPhone, draft.clientEmail]
      .filter(Boolean)
      .join(" · "),
  );

  const safeClientIdentification = escapeHtml(
    draft.clientIdentification || "",
  );

  const safeClientAddress = escapeHtml(
    draft.clientAddress || "",
  );

  const safeNotes = draft.notes
    ? escapeHtml(draft.notes).replaceAll(
        "\n",
        "<br />",
      )
    : "Sin observaciones adicionales.";

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <style>
          @page {
            size: A4;
            margin: 24px;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #0f172a;
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              sans-serif;
            font-size: 12px;
            line-height: 1.45;
          }

          .header {
            padding: 24px;
            border-radius: 16px;
            color: #ffffff;
            background: #0f172a;
          }

          .brand {
            color: #4ade80;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
          }

          h1 {
            margin: 7px 0 0;
            font-size: 26px;
          }

          .metadata {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-top: 22px;
          }

          .metadata-block {
            flex: 1;
          }

          .label {
            margin-bottom: 3px;
            color: #64748b;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.7px;
            text-transform: uppercase;
          }

          .value {
            font-size: 13px;
            font-weight: 700;
          }

          .section {
            margin-top: 24px;
          }

          .section-title {
            margin-bottom: 10px;
            font-size: 15px;
            font-weight: 900;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            padding: 10px 8px;
            color: #475569;
            background: #f1f5f9;
            border-bottom: 1px solid #cbd5e1;
            font-size: 10px;
            text-align: left;
            text-transform: uppercase;
          }

          td {
            padding: 11px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
          }

          .number {
            width: 30px;
            color: #64748b;
          }

          .right {
            text-align: right;
            white-space: nowrap;
          }

          .strong {
            font-weight: 800;
          }

          .details {
            margin-top: 4px;
            color: #64748b;
            font-size: 10px;
          }

          .summary {
            width: 310px;
            margin-top: 22px;
            margin-left: auto;
            padding: 18px;
            border-radius: 14px;
            background: #f8fafc;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            padding: 5px 0;
          }

          .summary-total {
            margin-top: 9px;
            padding-top: 12px;
            border-top: 1px solid #cbd5e1;
            font-size: 17px;
            font-weight: 900;
          }

          .notes {
            padding: 16px;
            border-radius: 12px;
            color: #334155;
            background: #f8fafc;
          }

          .footer {
            margin-top: 28px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 9px;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <header class="header">
          <div class="brand">Contractor Pro</div>
          <h1>${safeTitle}</h1>
        </header>

        <section class="metadata">
          <div class="metadata-block">
            <div class="label">Cliente</div>
            <div class="value">${safeClient}</div>
            ${
              safeClientCompany
                ? `<div class="details">${safeClientCompany}</div>`
                : ""
            }
            ${
              safeClientContact
                ? `<div class="details">${safeClientContact}</div>`
                : ""
            }
            ${
              safeClientIdentification
                ? `<div class="details">Cédula/RUC: ${safeClientIdentification}</div>`
                : ""
            }
            ${
              safeClientAddress
                ? `<div class="details">${safeClientAddress}</div>`
                : ""
            }
          </div>

          <div class="metadata-block">
            <div class="label">Fecha</div>
            <div class="value">
              ${formatDate(draft.updatedAt)}
            </div>
          </div>

          <div class="metadata-block">
            <div class="label">Referencia</div>
            <div class="value">
              ${escapeHtml(
                draft.id.slice(-12).toUpperCase(),
              )}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-title">
            Desglose del presupuesto
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Descripción</th>
                <th class="right">Cantidad</th>
                <th>Unidad</th>
                <th class="right">P. unitario</th>
                <th class="right">Total</th>
              </tr>
            </thead>

            <tbody>
              ${createItemRows(draft.items)}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Costo directo</span>
              <strong>
                ${formatMoney(totals.directCost)}
              </strong>
            </div>

            <div class="summary-row">
              <span>
                Costos indirectos
                (${formatNumber(
                  draft.overheadPercentage,
                  2,
                )}%)
              </span>
              <strong>
                ${formatMoney(totals.overhead)}
              </strong>
            </div>

            <div class="summary-row">
              <span>
                Utilidad
                (${formatNumber(
                  draft.profitPercentage,
                  2,
                )}%)
              </span>
              <strong>
                ${formatMoney(totals.profit)}
              </strong>
            </div>

            <div class="summary-row">
              <span>Descuento</span>
              <strong>
                - ${formatMoney(totals.discount)}
              </strong>
            </div>

            <div class="summary-row">
              <span>
                ITBMS
                (${formatNumber(
                  draft.taxPercentage,
                  2,
                )}%)
              </span>
              <strong>
                ${formatMoney(totals.tax)}
              </strong>
            </div>

            <div class="summary-row summary-total">
              <span>Total</span>
              <span>${formatMoney(totals.total)}</span>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-title">
            Notas y condiciones
          </div>

          <div class="notes">${safeNotes}</div>
        </section>

        <footer class="footer">
          Documento generado con Contractor Pro.
          Este presupuesto está sujeto a las condiciones
          indicadas y a la vigencia acordada con el cliente.
        </footer>
      </body>
    </html>
  `;
}

export async function generateAndShareBudgetPdf(
  draft: BudgetDraft,
  totals: BudgetTotals,
): Promise<void> {
  const html = createBudgetHtml(draft, totals);

  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare =
    await Sharing.isAvailableAsync();

  if (!canShare) {
    await Print.printAsync({ uri });
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Compartir presupuesto",
    UTI: "com.adobe.pdf",
  });
}
