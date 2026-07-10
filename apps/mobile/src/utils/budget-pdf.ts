import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  formatMoney,
  getBudgetStatusLabel,
  type BudgetItem,
  type BudgetSection,
  type BudgetWithDetails,
} from "@/types/budget";
import { getClientDisplayName } from "@/types/client";
import type { Company } from "@/types/company";

type BudgetPdfInput = {
  company: Company;
  budget: BudgetWithDetails;
};

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "No definido";

  return new Intl.DateTimeFormat("es-PA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function renderItems(
  section: BudgetSection | null,
  items: BudgetItem[],
) {
  const sectionName = section?.name ?? "Sin sección";

  if (items.length === 0) {
    return `
      <tr>
        <td colspan="5" class="empty-row">
          No hay partidas en esta sección.
        </td>
      </tr>
    `;
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
              ${formatMoney(item.unit_price)}
            </td>
            <td class="right strong">
              ${formatMoney(item.subtotal)}
            </td>
          </tr>
        `,
      )
      .join("")}
  `;
}

export function buildBudgetHtml({
  company,
  budget,
}: BudgetPdfInput) {
  const clientName = budget.client
    ? getClientDisplayName(budget.client)
    : "Cliente no registrado";

  const address =
    budget.address?.address ||
    company.address ||
    "Sin dirección registrada";

  const sectionsHtml = budget.sections
    .map((section) => {
      const items = budget.items.filter(
        (item) => item.section_id === section.id,
      );

      return renderItems(section, items);
    })
    .join("");

  const orphanItems = budget.items.filter(
    (item) => !item.section_id,
  );

  const orphanHtml =
    orphanItems.length > 0
      ? renderItems(null, orphanItems)
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
      border-bottom: 3px solid #2563eb;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }

    .company-name {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
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
      color: #2563eb;
    }

    .status {
      margin-top: 6px;
      color: #475569;
      font-weight: 700;
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
      background: #0f172a;
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
      background: #e0ecff;
      color: #1d4ed8;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .center {
      text-align: center;
    }

    .right {
      text-align: right;
    }

    .strong {
      font-weight: 900;
    }

    .item-note {
      color: #64748b;
      margin-top: 4px;
      font-size: 11px;
      line-height: 1.4;
    }

    .empty-row {
      text-align: center;
      color: #64748b;
      font-style: italic;
    }

    .totals {
      width: 300px;
      margin-left: auto;
      margin-top: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
    }

    .total-row:last-child {
      border-bottom: none;
    }

    .total-final {
      background: #2563eb;
      color: #ffffff;
      font-size: 16px;
      font-weight: 900;
    }

    .terms {
      margin-top: 24px;
      padding: 14px;
      border-radius: 12px;
      background: #f8fafc;
      color: #475569;
      line-height: 1.5;
    }

    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 11px;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="header">
    <div>
      <div class="company-name">
        ${escapeHtml(company.name)}
      </div>

      <div class="company-meta">
        ${escapeHtml(company.phone || "Sin teléfono")}<br />
        ${escapeHtml(company.email || "Sin correo")}<br />
        ${escapeHtml(company.address || "Sin dirección fiscal")}
      </div>
    </div>

    <div class="doc-box">
      <div class="doc-label">Presupuesto</div>
      <div class="doc-number">
        ${escapeHtml(budget.budget_number)}
      </div>
      <div class="status">
        ${escapeHtml(getBudgetStatusLabel(budget.status))}
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Cliente</div>
      <div class="main-text">${escapeHtml(clientName)}</div>
      <div class="muted">
        ${escapeHtml(budget.client?.phone || "Sin teléfono")}<br />
        ${escapeHtml(budget.client?.email || "Sin correo")}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Proyecto</div>
      <div class="main-text">
        ${escapeHtml(budget.project?.name || budget.title)}
      </div>
      <div class="muted">
        ${escapeHtml(address)}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Fecha</div>
      <div class="main-text">
        ${formatDate(budget.created_at)}
      </div>
      <div class="muted">
        Válido hasta: ${formatDate(budget.valid_until)}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Moneda e impuesto</div>
      <div class="main-text">
        ${escapeHtml(budget.currency_code)}
      </div>
      <div class="muted">
        ITBMS: ${Number(budget.tax_rate).toFixed(2)}%
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th class="center">Unidad</th>
        <th class="right">Cantidad</th>
        <th class="right">Precio</th>
        <th class="right">Subtotal</th>
      </tr>
    </thead>

    <tbody>
      ${sectionsHtml}
      ${orphanHtml}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <strong>${formatMoney(budget.subtotal)}</strong>
    </div>

    <div class="total-row">
      <span>Descuento</span>
      <strong>${formatMoney(budget.discount_amount)}</strong>
    </div>

    <div class="total-row">
      <span>ITBMS ${Number(budget.tax_rate).toFixed(2)}%</span>
      <strong>${formatMoney(budget.tax_amount)}</strong>
    </div>

    <div class="total-row total-final">
      <span>Total</span>
      <span>${formatMoney(budget.total)}</span>
    </div>
  </div>

  <div class="terms">
    <strong>Condiciones:</strong><br />
    ${escapeHtml(budget.terms || "Sin condiciones registradas.")}
  </div>

  <div class="footer">
    Documento generado desde Contractor Pro.
  </div>
</body>
</html>
`;
}

export async function generateBudgetPdf({
  company,
  budget,
}: BudgetPdfInput): Promise<{
  uri: string | null;
  error: string | null;
}> {
  try {
    const html = buildBudgetHtml({
      company,
      budget,
    });

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return {
      uri,
      error: null,
    };
  } catch (error) {
    return {
      uri: null,
      error:
        error instanceof Error
          ? error.message
          : "No fue posible generar el PDF.",
    };
  }
}

export async function shareBudgetPdf({
  company,
  budget,
}: BudgetPdfInput): Promise<{
  uri: string | null;
  error: string | null;
}> {
  const { uri, error } = await generateBudgetPdf({
    company,
    budget,
  });

  if (error || !uri) {
    return {
      uri: null,
      error:
        error ||
        "No fue posible generar el archivo PDF.",
    };
  }

  const canShare = await Sharing.isAvailableAsync();

  if (!canShare) {
    return {
      uri,
      error:
        "Este dispositivo no permite compartir archivos desde la app.",
    };
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: `Compartir ${budget.budget_number}`,
    UTI: "com.adobe.pdf",
  });

  return {
    uri,
    error: null,
  };
}

export async function generateAndShareBudgetPdf(
  budget: unknown,
  totals?: unknown,
) {
  console.warn(
    "generateAndShareBudgetPdf está usando compatibilidad temporal. La pantalla vieja de presupuestos debe migrarse luego al nuevo flujo.",
    {
      budget,
      totals,
    },
  );

  return {
    uri: null,
    error:
      "Esta pantalla usa el sistema anterior de presupuestos. Abre el presupuesto desde Proyecto → Presupuestos para generar el PDF nuevo.",
  };
}