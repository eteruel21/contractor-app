import { supabase } from "@/services/supabase";
import type {
  Budget,
  BudgetItem,
  BudgetItemType,
  BudgetSection,
  BudgetWithDetails,
} from "@/types/budget";
import type { Client, ClientAddress } from "@/types/client";
import type { Project } from "@/types/project";

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

// Tipo para presupuestos visibles por el usuario cliente vinculado
export type ClientBudgetSummary = Budget & {
  project: { name: string } | null;
  company: { name: string } | null;
};

export async function listBudgetsByProject(
  companyId: string,
  projectId: string,
): Promise<{
  budgets: Budget[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      budgets: [],
      error: error.message,
    };
  }

  return {
    budgets: (data ?? []) as Budget[],
    error: null,
  };
}

export async function listBudgetsByCompany(
  companyId: string,
): Promise<{
  budgets: Budget[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      budgets: [],
      error: error.message,
    };
  }

  return {
    budgets: (data ?? []) as Budget[],
    error: null,
  };
}

export async function createBudgetFromProject(input: {
  companyId: string;
  projectId: string;
  title?: string;
}): Promise<{
  budgetId: string | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc(
    "create_project_budget",
    {
      requested_company_id: input.companyId,
      requested_project_id: input.projectId,
      budget_title: input.title?.trim() || undefined,
    },
  );

  if (error) {
    return {
      budgetId: null,
      error: error.message,
    };
  }

  return {
    budgetId: typeof data === "string" ? data : null,
    error: null,
  };
}

export async function getBudgetById(
  companyId: string,
  budgetId: string,
): Promise<{
  budget: BudgetWithDetails | null;
  error: string | null;
}> {
  const { data: budgetData, error: budgetError } =
    await supabase
      .from("budgets")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", budgetId)
      .single();

  if (budgetError) {
    return {
      budget: null,
      error: budgetError.message,
    };
  }

  const budget = budgetData as Budget;

  const [
    { data: sectionsData, error: sectionsError },
    { data: itemsData, error: itemsError },
    { data: clientData },
    { data: projectData },
  ] = await Promise.all([
    supabase
      .from("budget_sections")
      .select("*")
      .eq("company_id", companyId)
      .eq("budget_id", budgetId)
      .order("sort_order", {
        ascending: true,
      }),

    supabase
      .from("budget_items")
      .select("*")
      .eq("company_id", companyId)
      .eq("budget_id", budgetId)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      }),

    supabase
      .from("clients")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", budget.client_id)
      .maybeSingle(),

    supabase
      .from("projects")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", budget.project_id)
      .maybeSingle(),
  ]);

  if (sectionsError) {
    return {
      budget: null,
      error: sectionsError.message,
    };
  }

  if (itemsError) {
    return {
      budget: null,
      error: itemsError.message,
    };
  }

  let addressData = null;

  if (projectData?.address_id) {
    const { data } = await supabase
      .from("client_addresses")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", projectData.address_id)
      .maybeSingle();

    addressData = data;
  }

  return {
    budget: {
      ...budget,
      sections:
        (sectionsData ?? []) as BudgetSection[],
      items: (itemsData ?? []) as BudgetItem[],
      client: (clientData ?? null) as Client | null,
      project: (projectData ?? null) as Project | null,
      address: (addressData ?? null) as ClientAddress | null,
    },
    error: null,
  };
}

export async function addBudgetItem(
  input: CreateBudgetItemInput,
): Promise<{
  item: BudgetItem | null;
  error: string | null;
}> {
  const cleanDescription =
    input.description.trim();

  if (cleanDescription.length < 2) {
    return {
      item: null,
      error: "Introduce una descripción válida.",
    };
  }

  if (input.quantity <= 0) {
    return {
      item: null,
      error: "La cantidad debe ser mayor que cero.",
    };
  }

  if (input.unitPrice < 0) {
    return {
      item: null,
      error: "El precio no puede ser negativo.",
    };
  }

  const { data, error } = await supabase
    .from("budget_items")
    .insert({
      company_id: input.companyId,
      budget_id: input.budgetId,
      section_id: input.sectionId ?? null,
      catalog_item_id: input.catalogItemId ?? null,
      platform_catalog_item_id: input.platformCatalogItemId ?? null,
      item_type: input.itemType ?? "manual",
      description: cleanDescription,
      unit_name: input.unitName.trim() || "unidad",
      quantity: input.quantity,
      unit_cost: input.unitCost ?? 0,
      unit_price: input.unitPrice,
      discount_percentage:
        input.discountPercentage ?? 0,
      taxable: input.taxable ?? true,
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return {
      item: null,
      error: error.message,
    };
  }

  return {
    item: data as BudgetItem,
    error: null,
  };
}

export async function deleteBudgetItem(input: {
  companyId: string;
  budgetId: string;
  itemId: string;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("budget_items")
    .delete()
    .eq("company_id", input.companyId)
    .eq("budget_id", input.budgetId)
    .eq("id", input.itemId);

  return {
    error: error?.message ?? null,
  };
}

/**
 * Lista los presupuestos visibles para un usuario cliente usando una sola query
 * con JOIN directo desde clients.user_id, en lugar de las tres queries
 * secuenciales anteriores (clients → projects → budgets).
 */
export async function listBudgetsForClient(
  userId: string,
): Promise<{
  budgets: ClientBudgetSummary[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("budgets")
    .select(`
      *,
      project:projects (name),
      company:companies (name),
      client:clients!inner (user_id)
    `)
    .eq("client.user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      budgets: [],
      error: error.message,
    };
  }

  const parsedBudgets = (data ?? []).map((budget) => {
    const projectValue = Array.isArray(budget.project)
      ? budget.project[0]
      : budget.project;
    const companyValue = Array.isArray(budget.company)
      ? budget.company[0]
      : budget.company;

    return {
      ...budget,
      project: (projectValue ?? null) as { name: string } | null,
      company: (companyValue ?? null) as { name: string } | null,
      // Omitir la relación client que solo se usó como filtro
      client: undefined,
    };
  });

  return {
    budgets: parsedBudgets as ClientBudgetSummary[],
    error: null,
  };
}
