import {
  authenticatedRequest
} from "@/services/api";
import type {
  Budget,
  BudgetItem,
  BudgetItemType,
  BudgetSection,
  BudgetWithDetails
} from "@/types/budget";
import type {
  Client,
  ClientAddress
} from "@/types/client";
import type {
  Project
} from "@/types/project";

type CreateBudgetItemInput = {
  companyId: string;
  budgetId: string;
  sectionId?: string | null;
  catalogItemId?: string | null;
  platformCatalogItemId?: string | null;
  itemType?: BudgetItemType;
  description: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  discountPercentage?: number;
  taxable?: boolean;
  notes?: string;
};

export type ClientBudgetSummary =
  Budget & {
    project: {
      name: string;
    } | null;

    company: {
      name: string;
    } | null;
  };

type BudgetRow =
  Omit<
    Budget,
    | "subtotal"
    | "discount_value"
    | "discount_amount"
    | "tax_rate"
    | "tax_amount"
    | "total"
  > & {
    subtotal: number | string;
    discount_value: number | string;
    discount_amount: number | string;
    tax_rate: number | string;
    tax_amount: number | string;
    total: number | string;
  };

type BudgetItemRow =
  Omit<
    BudgetItem,
    | "quantity"
    | "unit_cost"
    | "unit_price"
    | "discount_percentage"
    | "subtotal"
  > & {
    quantity: number | string;
    unit_cost: number | string;
    unit_price: number | string;
    discount_percentage:
      | number
      | string;
    subtotal: number | string;
  };

type ProjectRow =
  Omit<
    Project,
    | "budget_estimate"
    | "contract_value"
    | "progress_percentage"
  > & {
    budget_estimate:
      | number
      | string;
    contract_value:
      | number
      | string;
    progress_percentage:
      | number
      | string;
  };

function normalizeBudget(
  budget: BudgetRow
): Budget {
  return {
    ...budget,
    subtotal:
      Number(budget.subtotal ?? 0),
    discount_value:
      Number(
        budget.discount_value ?? 0
      ),
    discount_amount:
      Number(
        budget.discount_amount ?? 0
      ),
    tax_rate:
      Number(budget.tax_rate ?? 0),
    tax_amount:
      Number(
        budget.tax_amount ?? 0
      ),
    total:
      Number(budget.total ?? 0)
  };
}

function normalizeItem(
  item: BudgetItemRow
): BudgetItem {
  return {
    ...item,
    quantity:
      Number(item.quantity ?? 0),
    unit_cost:
      Number(item.unit_cost ?? 0),
    unit_price:
      Number(item.unit_price ?? 0),
    discount_percentage:
      Number(
        item.discount_percentage ?? 0
      ),
    subtotal:
      Number(item.subtotal ?? 0)
  };
}

function normalizeProject(
  project: ProjectRow
): Project {
  return {
    ...project,
    budget_estimate:
      Number(
        project.budget_estimate ?? 0
      ),
    contract_value:
      Number(
        project.contract_value ?? 0
      ),
    progress_percentage:
      Number(
        project.progress_percentage ?? 0
      )
  };
}

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listBudgetsByProject(
  companyId: string,
  projectId: string
): Promise<{
  budgets: Budget[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        budgets: BudgetRow[];
      }>(
        `/budgets?companyId=${encodeURIComponent(companyId)}&projectId=${encodeURIComponent(projectId)}`
      );

    return {
      budgets:
        response.budgets.map(
          normalizeBudget
        ),
      error: null
    };
  } catch (error) {
    return {
      budgets: [],
      error: errorMessage(error)
    };
  }
}

export async function listBudgetsByCompany(
  companyId: string
): Promise<{
  budgets: Budget[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        budgets: BudgetRow[];
      }>(
        `/budgets?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      budgets:
        response.budgets.map(
          normalizeBudget
        ),
      error: null
    };
  } catch (error) {
    return {
      budgets: [],
      error: errorMessage(error)
    };
  }
}

export async function createBudgetFromProject(
  input: {
    companyId: string;
    projectId: string;
    title?: string;
  }
): Promise<{
  budgetId: string | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        budgetId: string;
      }>(
        "/budgets/from-project",
        {
          method: "POST",
          body: JSON.stringify({
            companyId:
              input.companyId,
            projectId:
              input.projectId,
            title:
              input.title?.trim() || ""
          })
        }
      );

    return {
      budgetId:
        response.budgetId,
      error: null
    };
  } catch (error) {
    return {
      budgetId: null,
      error: errorMessage(error)
    };
  }
}

export async function getBudgetById(
  companyId: string,
  budgetId: string
): Promise<{
  budget: BudgetWithDetails | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        budget:
          BudgetRow & {
            sections:
              BudgetSection[];
            items:
              BudgetItemRow[];
            client:
              Client | null;
            project:
              ProjectRow | null;
            address:
              ClientAddress | null;
          };
      }>(
        `/budgets/${budgetId}?companyId=${encodeURIComponent(companyId)}`
      );

    const source =
      response.budget;

    return {
      budget: {
        ...normalizeBudget(source),
        sections:
          source.sections,
        items:
          source.items.map(
            normalizeItem
          ),
        client:
          source.client,
        project:
          source.project
            ? normalizeProject(
                source.project
              )
            : null,
        address:
          source.address
      },
      error: null
    };
  } catch (error) {
    return {
      budget: null,
      error: errorMessage(error)
    };
  }
}

export async function addBudgetItem(
  input: CreateBudgetItemInput
): Promise<{
  item: BudgetItem | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        item: BudgetItemRow;
      }>(
        `/budgets/${input.budgetId}/items`,
        {
          method: "POST",
          body: JSON.stringify({
            companyId:
              input.companyId,
            sectionId:
              input.sectionId ?? null,
            catalogItemId:
              input.catalogItemId ?? null,
            platformCatalogItemId:
              input.platformCatalogItemId ??
              null,
            itemType:
              input.itemType ?? "manual",
            description:
              input.description.trim(),
            unitName:
              input.unitName.trim() ||
              "unidad",
            quantity:
              input.quantity,
            unitPrice:
              input.unitPrice,
            unitCost:
              input.unitCost ?? 0,
            discountPercentage:
              input.discountPercentage ??
              0,
            taxable:
              input.taxable ?? true,
            notes:
              input.notes?.trim() || ""
          })
        }
      );

    return {
      item:
        normalizeItem(
          response.item
        ),
      error: null
    };
  } catch (error) {
    return {
      item: null,
      error: errorMessage(error)
    };
  }
}

export async function deleteBudgetItem(
  input: {
    companyId: string;
    budgetId: string;
    itemId: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/budgets/${input.budgetId}/items/${input.itemId}?companyId=${encodeURIComponent(input.companyId)}`,
      {
        method: "DELETE"
      }
    );

    return {
      error: null
    };
  } catch (error) {
    return {
      error: errorMessage(error)
    };
  }
}

export async function listBudgetsForClient(
  _userId: string
): Promise<{
  budgets: ClientBudgetSummary[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        budgets:
          (BudgetRow & {
              project:
                | {
                    name: string;
                  }
                | null;

              company:
                | {
                    name: string;
                  }
                | null;
            })[];
      }>("/budgets/client");

    return {
      budgets:
        response.budgets.map(
          (budget) => ({
            ...normalizeBudget(
              budget
            ),
            project:
              budget.project ?? null,
            company:
              budget.company ?? null
          })
        ),
      error: null
    };
  } catch (error) {
    return {
      budgets: [],
      error: errorMessage(error)
    };
  }
}