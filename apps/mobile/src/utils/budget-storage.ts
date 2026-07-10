import {
  loadLocalData,
  saveLocalData,
} from "./local-storage";

export type BudgetItemSource =
  | "concrete-calculator"
  | "manual";

export type BudgetItem = {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  source: BudgetItemSource;
  createdAt: string;
};

export type BudgetDraft = {
  id: string;
  title: string;

  clientId: string;
  clientName: string;
  clientCompany: string;
  clientPhone: string;
  clientEmail: string;
  clientIdentification: string;
  clientAddress: string;

  notes: string;

  overheadPercentage: number;
  profitPercentage: number;
  discount: number;
  taxPercentage: number;

  items: BudgetItem[];

  createdAt: string;
  updatedAt: string;
};

const BUDGET_DRAFT_KEY =
  "@contractor-pro/current-budget";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export function createEmptyBudgetDraft(): BudgetDraft {
  const now = new Date().toISOString();

  return {
    id: createId("budget"),
    title: "Presupuesto sin título",

    clientId: "",
    clientName: "",
    clientCompany: "",
    clientPhone: "",
    clientEmail: "",
    clientIdentification: "",
    clientAddress: "",

    notes: "",

    overheadPercentage: 10,
    profitPercentage: 20,
    discount: 0,
    taxPercentage: 7,

    items: [],

    createdAt: now,
    updatedAt: now,
  };
}

function normalizeBudgetDraft(
  draft: BudgetDraft,
): BudgetDraft {
  return {
    ...createEmptyBudgetDraft(),
    ...draft,

    overheadPercentage:
      Number.isFinite(draft.overheadPercentage)
        ? draft.overheadPercentage
        : 10,

    profitPercentage:
      Number.isFinite(draft.profitPercentage)
        ? draft.profitPercentage
        : 20,

    discount: Number.isFinite(draft.discount)
      ? draft.discount
      : 0,

    taxPercentage:
      Number.isFinite(draft.taxPercentage)
        ? draft.taxPercentage
        : 7,

    items: Array.isArray(draft.items)
      ? draft.items
      : [],
  };
}

export async function getBudgetDraft(): Promise<BudgetDraft> {
  const stored =
    await loadLocalData<BudgetDraft>(BUDGET_DRAFT_KEY);

  return stored
    ? normalizeBudgetDraft(stored)
    : createEmptyBudgetDraft();
}

export async function saveBudgetDraft(
  draft: BudgetDraft,
): Promise<void> {
  await saveLocalData(BUDGET_DRAFT_KEY, {
    ...draft,
    updatedAt: new Date().toISOString(),
  });
}

export async function addBudgetItem(
  item: Omit<BudgetItem, "id" | "createdAt">,
): Promise<BudgetDraft> {
  const draft = await getBudgetDraft();

  const updatedDraft: BudgetDraft = {
    ...draft,
    items: [
      ...draft.items,
      {
        ...item,
        id: createId("item"),
        createdAt: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  await saveBudgetDraft(updatedDraft);

  return updatedDraft;
}

export async function addManualBudgetItem(): Promise<BudgetDraft> {
  return addBudgetItem({
    description: "Nueva partida",
    details: "",
    quantity: 1,
    unit: "und",
    unitPrice: 0,
    source: "manual",
  });
}

export async function removeBudgetItem(
  itemId: string,
): Promise<BudgetDraft> {
  const draft = await getBudgetDraft();

  const updatedDraft: BudgetDraft = {
    ...draft,
    items: draft.items.filter(
      (item) => item.id !== itemId,
    ),
    updatedAt: new Date().toISOString(),
  };

  await saveBudgetDraft(updatedDraft);

  return updatedDraft;
}

export async function clearBudgetDraft(): Promise<BudgetDraft> {
  const emptyDraft = createEmptyBudgetDraft();
  await saveBudgetDraft(emptyDraft);

  return emptyDraft;
}
