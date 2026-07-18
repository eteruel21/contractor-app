import {
  authenticatedRequest
} from "@/services/api";
import {
  createPollingSubscription
} from "@/services/polling-service";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemWithDetails,
  Unit
} from "@/types/catalog";

export type PricingHistoryItem = {
  id: string;
  company_id: string;
  catalog_item_id: string;
  unit_cost: number;
  sale_price: number;
  previous_unit_cost: number | null;
  previous_sale_price: number | null;
  effective_at: string;
  created_at: string;
  changed_by: string | null;
  changed_by_name: string | null;
  source: string | null;
  notes: string | null;

  item: {
    id: string;
    name: string;
    sku: string | null;
    active: boolean;

    unit: {
      name: string;
      symbol: string;
    } | null;
  } | null;
};

type CatalogItemRow =
  Omit<
    CatalogItem,
    | "unit_cost"
    | "sale_price"
    | "waste_percentage"
  > & {
    unit_cost: number | string;
    sale_price: number | string;
    waste_percentage:
      | number
      | string;
    unit: Unit | null;
    category:
      CatalogCategory | null;
  };

type PricingHistoryRow =
  Omit<
    PricingHistoryItem,
    | "unit_cost"
    | "sale_price"
    | "previous_unit_cost"
    | "previous_sale_price"
  > & {
    unit_cost: number | string;
    sale_price: number | string;

    previous_unit_cost:
      | number
      | string
      | null;

    previous_sale_price:
      | number
      | string
      | null;
  };

function normalizeCatalogItem(
  row: CatalogItemRow
): CatalogItemWithDetails {
  return {
    ...row,
    unit_cost:
      Number(row.unit_cost ?? 0),
    sale_price:
      Number(row.sale_price ?? 0),
    waste_percentage:
      Number(
        row.waste_percentage ?? 0
      ),
    unit: row.unit ?? null,
    category: row.category ?? null
  };
}

function normalizeHistory(
  row: PricingHistoryRow
): PricingHistoryItem {
  return {
    ...row,
    unit_cost:
      Number(row.unit_cost ?? 0),
    sale_price:
      Number(row.sale_price ?? 0),

    previous_unit_cost:
      row.previous_unit_cost === null
        ? null
        : Number(
            row.previous_unit_cost
          ),

    previous_sale_price:
      row.previous_sale_price === null
        ? null
        : Number(
            row.previous_sale_price
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

export async function listPricingItems(
  companyId: string
): Promise<{
  items: CatalogItemWithDetails[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        items: CatalogItemRow[];
      }>(
        `/pricing/items?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      items:
        response.items.map(
          normalizeCatalogItem
        ),
      error: null
    };
  } catch (error) {
    return {
      items: [],
      error: errorMessage(error)
    };
  }
}

export async function updateCatalogPricing(
  input: {
    companyId: string;
    itemId: string;
    unitCost: number;
    salePrice: number;
    wastePercentage: number;
    source?: string;
    notes?: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/pricing/items/${input.itemId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId:
            input.companyId,
          unitCost:
            Math.max(
              input.unitCost,
              0
            ),
          salePrice:
            Math.max(
              input.salePrice,
              0
            ),
          wastePercentage:
            Math.min(
              Math.max(
                input.wastePercentage,
                0
              ),
              100
            ),
          source:
            input.source?.trim() ||
            "panel_administrativo",
          notes:
            input.notes?.trim() ||
            ""
        })
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

export async function adjustCatalogPrices(
  input: {
    companyId: string;
    itemIds: string[];
    target:
      | "unit_cost"
      | "sale_price";
    percentage: number;
    notes?: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      "/pricing/adjust",
      {
        method: "POST",
        body: JSON.stringify({
          companyId:
            input.companyId,
          itemIds:
            input.itemIds,
          target:
            input.target,
          percentage:
            input.percentage,
          notes:
            input.notes?.trim() ||
            ""
        })
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

export async function listPricingHistory(
  companyId: string
): Promise<{
  history: PricingHistoryItem[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        history:
          PricingHistoryRow[];
      }>(
        `/pricing/history?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      history:
        response.history.map(
          normalizeHistory
        ),
      error: null
    };
  } catch (error) {
    return {
      history: [],
      error: errorMessage(error)
    };
  }
}

export function subscribeToPricing(
  _companyId: string,
  onChange: () => void
): () => void {
  return createPollingSubscription(
    onChange,
    15000
  );
}