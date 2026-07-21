import { authenticatedRequest } from "./api";

export interface SaveCalculationParams {
  companyId: string;
  projectId?: string | null;
  clientId?: string | null;
  formulaCode: string;
  title: string;
  inputData: Record<string, any>;
  priceData: Record<string, any>;
  resultsData: Record<string, any>;
  totalCost: number;
}

export interface SavedCalculation {
  id: string;
  company_id: string;
  project_id: string | null;
  client_id: string | null;
  formula_code: string;
  title: string;
  input_data: Record<string, any>;
  price_data: Record<string, any>;
  results_data: Record<string, any>;
  total_cost: number;
  created_at: string;
  project?: { name: string; project_code: string } | null;
  client?: { name: string } | null;
}

export async function saveCalculation(params: SaveCalculationParams): Promise<SavedCalculation> {
  const data = await authenticatedRequest<{ calculation: SavedCalculation }>("/calculations", {
    method: "POST",
    body: JSON.stringify(params)
  });
  return data.calculation;
}

export async function fetchCompanyCalculations(
  companyId: string,
  projectId?: string,
  clientId?: string
): Promise<SavedCalculation[]> {
  const searchParams = new URLSearchParams({ companyId });
  if (projectId) searchParams.set("projectId", projectId);
  if (clientId) searchParams.set("clientId", clientId);

  const data = await authenticatedRequest<{ calculations: SavedCalculation[] }>(
    `/calculations?${searchParams.toString()}`
  );
  return data.calculations;
}

export async function fetchCalculationDetail(calculationId: string, companyId: string): Promise<SavedCalculation> {
  const data = await authenticatedRequest<{ calculation: SavedCalculation }>(
    `/calculations/${calculationId}?companyId=${encodeURIComponent(companyId)}`
  );
  return data.calculation;
}

export async function deleteCalculation(calculationId: string, companyId: string): Promise<void> {
  await authenticatedRequest(`/calculations/${calculationId}?companyId=${encodeURIComponent(companyId)}`, {
    method: "DELETE"
  });
}

export async function convertCalculationToBudgetItems(
  budgetId: string,
  companyId: string,
  calculationId?: string,
  items?: any[]
): Promise<any[]> {
  const data = await authenticatedRequest<{ items: any[] }>(`/budgets/${budgetId}/items/from-calculation`, {
    method: "POST",
    body: JSON.stringify({
      companyId,
      calculationId,
      items
    })
  });
  return data.items;
}
