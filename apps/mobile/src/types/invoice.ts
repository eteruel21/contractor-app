import type { Client } from "@/types/client";
import type { BudgetWithDetails } from "@/types/budget";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type InvoiceManualStatus = "overdue";

export type InvoicePaymentStatus = "confirmed" | "reversed";
export type InvoiceCreditNoteStatus = "issued" | "cancelled";

export type InvoicePaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card"
  | "check"
  | "other";

export type InvoiceSnapshot = {
  schemaVersion: 1;
  invoice: {
    number: string;
    issueDate: string;
    dueDate: string | null;
    notes: string | null;
  };
  company: {
    id: string;
    name: string;
    legalName: string | null;
    taxId: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    logoUrl: string | null;
    timezone: string;
  };
  client: {
    id: string;
    type: string;
    firstName: string | null;
    lastName: string | null;
    businessName: string | null;
    documentType: string | null;
    documentNumber: string | null;
    phone: string | null;
    secondaryPhone: string | null;
    email: string | null;
    address: Record<string, unknown> | null;
  };
  sections: Array<{
    id: string;
    name: string;
    description: string | null;
    sortOrder: number;
  }>;
  items: Array<{
    id: string;
    sectionId: string | null;
    catalogItemId: string | null;
    platformCatalogItemId: string | null;
    itemType: string;
    description: string;
    unitName: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    discountPercentage: number;
    subtotal: number;
    taxable: boolean;
    sortOrder: number;
    notes: string | null;
  }>;
  taxes: Array<{
    name: string;
    rate: number;
    taxableAmount: number;
    amount: number;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  currency: string;
  conditions: string | null;
  source: {
    budgetId: string;
    budgetNumber: string;
    budgetVersion: number;
    projectId: string;
    title: string;
  };
};

export type Invoice = {
  id: string;
  company_id: string;
  budget_id: string | null;
  client_id: string;
  invoice_number: string | null;
  status: InvoiceStatus;
  issue_date: string | null;
  due_date: string | null;
  notes: string | null;
  snapshot_schema_version: 1 | null;
  snapshot_data: InvoiceSnapshot | null;
  issued_at: string | null;
  issued_by: string | null;
  total_amount: number | null;
  adjusted_total_amount: number | null;
  total_paid: number;
  total_credit: number;
  balance_due: number | null;
  customer_credit: number;
  payment_count: number;
  credit_note_count: number;
  created_at: string;
  updated_at: string;
};

export type ReceiptSnapshot = {
  schemaVersion: 1;
  receipt: {
    number: string;
    issuedAt: string;
  };
  company: InvoiceSnapshot["company"];
  client: InvoiceSnapshot["client"];
  invoice: {
    id: string;
    number: string;
    issueDate: string;
    total: number;
    currency: string;
  };
  payment: {
    id: string;
    number: string;
    method: InvoicePaymentMethod;
    amount: number;
    currency: string;
    paidAt: string;
    reference?: string;
    notes?: string;
  };
  totals: {
    creditTotal?: number;
    adjustedInvoiceTotal?: number;
    previousPaid: number;
    paymentAmount: number;
    totalPaid: number;
    balance: number;
  };
};

export type CreditNoteSnapshot = {
  schemaVersion: 1;
  creditNote: {
    id: string;
    number: string;
    issuedAt: string;
    amount: number;
    currency: string;
    reason: string;
  };
  company: InvoiceSnapshot["company"];
  client: InvoiceSnapshot["client"];
  invoice: {
    id: string;
    number: string;
    issueDate: string;
    total: number;
    currency: string;
  };
  totals: {
    previousCredit: number;
    creditAmount: number;
    totalCredit: number;
    adjustedInvoiceTotal: number;
    totalPaid: number;
    balance: number;
    customerCredit: number;
  };
};

export type InvoiceCreditNote = {
  id: string;
  company_id: string;
  invoice_id: string;
  credit_note_number: string;
  status: InvoiceCreditNoteStatus;
  amount: number;
  currency_code: string;
  reason: string;
  snapshot_schema_version: 1;
  snapshot_data: CreditNoteSnapshot;
  issued_at: string;
  issued_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoicePayment = {
  id: string;
  company_id: string;
  invoice_id: string;
  payment_number: string;
  receipt_number: string;
  status: InvoicePaymentStatus;
  method: InvoicePaymentMethod;
  amount: number;
  currency_code: string;
  paid_at: string;
  reference: string | null;
  notes: string | null;
  receipt_schema_version: 1;
  receipt_snapshot_data: ReceiptSnapshot;
  created_by: string | null;
  created_at: string;
  reversed_at: string | null;
  reversed_by: string | null;
  reversal_reason: string | null;
  updated_at: string;
};

export type InvoiceWithDetails = Invoice & {
  client: Client | null;
  budget: BudgetWithDetails | null;
};

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  const labels = {
    draft: "Borrador",
    issued: "Emitida",
    partially_paid: "Parcialmente pagada",
    paid: "Pagada",
    overdue: "Vencida",
    cancelled: "Cancelada",
  };
  return labels[status] || status;
}

export function getInvoicePaymentMethodLabel(
  method: InvoicePaymentMethod
): string {
  const labels: Record<InvoicePaymentMethod, string> = {
    cash: "Efectivo",
    bank_transfer: "Transferencia",
    card: "Tarjeta",
    check: "Cheque",
    other: "Otro",
  };

  return labels[method];
}
