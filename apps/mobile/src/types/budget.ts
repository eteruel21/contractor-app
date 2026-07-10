import type {
  Client,
  ClientAddress,
} from "@/types/client";
import type { Project } from "@/types/project";

export type BudgetStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled";

export type BudgetDiscountType =
  | "none"
  | "percent"
  | "fixed";

export type BudgetItemType =
  | "material"
  | "labor"
  | "equipment"
  | "service"
  | "subcontract"
  | "manual";

export type Budget = {
  id: string;
  company_id: string;
  client_id: string;
  project_id: string;
  budget_number: string;
  version: number;
  title: string;
  description: string | null;
  status: BudgetStatus;
  currency_code: string;
  subtotal: number;
  discount_type: BudgetDiscountType;
  discount_value: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  created_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetSection = {
  id: string;
  company_id: string;
  budget_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BudgetItem = {
  id: string;
  company_id: string;
  budget_id: string;
  section_id: string | null;
  catalog_item_id: string | null;
  calculation_run_id: string | null;
  item_type: BudgetItemType;
  description: string;
  unit_name: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  discount_percentage: number;
  subtotal: number;
  taxable: boolean;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetWithDetails = Budget & {
  sections: BudgetSection[];
  items: BudgetItem[];
  client: Client | null;
  project: Project | null;
  address: ClientAddress | null;
};

export function getBudgetStatusLabel(
  status: BudgetStatus,
): string {
  const labels: Record<BudgetStatus, string> = {
    draft: "Borrador",
    sent: "Enviado",
    viewed: "Visto",
    approved: "Aprobado",
    rejected: "Rechazado",
    expired: "Vencido",
    cancelled: "Cancelado",
  };

  return labels[status];
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}