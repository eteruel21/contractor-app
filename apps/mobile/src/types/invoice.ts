import type { Client } from "@/types/client";
import type { BudgetWithDetails } from "@/types/budget";

export type InvoiceStatus = "pending" | "paid" | "cancelled";

export type Invoice = {
  id: string;
  company_id: string;
  budget_id: string | null;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceWithDetails = Invoice & {
  client: Client | null;
  budget: BudgetWithDetails | null;
};

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  const labels = {
    pending: "Pendiente",
    paid: "Pagada",
    cancelled: "Cancelada",
  };
  return labels[status] || status;
}
