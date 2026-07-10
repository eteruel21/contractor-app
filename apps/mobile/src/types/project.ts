import type {
  Client,
  ClientAddress,
} from "@/types/client";

export type ProjectStatus =
  | "lead"
  | "inspection"
  | "quoted"
  | "approved"
  | "in_progress"
  | "paused"
  | "completed"
  | "cancelled";

export type Project = {
  id: string;
  company_id: string;
  client_id: string;
  address_id: string | null;
  project_code: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  estimated_end_date: string | null;
  actual_end_date: string | null;
  budget_estimate: number;
  contract_value: number;
  progress_percentage: number;
  project_manager_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectWithDetails = Project & {
  client: Client | null;
  address: ClientAddress | null;
};

export const PROJECT_STATUS_OPTIONS: {
  value: ProjectStatus;
  label: string;
}[] = [
  {
    value: "lead",
    label: "Prospecto",
  },
  {
    value: "inspection",
    label: "Inspección",
  },
  {
    value: "quoted",
    label: "Cotizado",
  },
  {
    value: "approved",
    label: "Aprobado",
  },
  {
    value: "in_progress",
    label: "En ejecución",
  },
  {
    value: "paused",
    label: "Pausado",
  },
  {
    value: "completed",
    label: "Completado",
  },
  {
    value: "cancelled",
    label: "Cancelado",
  },
];

export function getProjectStatusLabel(
  status: ProjectStatus,
): string {
  return (
    PROJECT_STATUS_OPTIONS.find(
      (option) => option.value === status,
    )?.label ?? status
  );
}