import { supabase } from "@/services/supabase";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemWithDetails,
  Unit,
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

function normalizeCatalogItem(
  row: Record<string, unknown>,
): CatalogItemWithDetails {
  const unitValue = Array.isArray(row.unit)
    ? row.unit[0]
    : row.unit;

  const categoryValue = Array.isArray(row.category)
    ? row.category[0]
    : row.category;

  return {
    ...(row as unknown as CatalogItem),
    unit: (unitValue ?? null) as Unit | null,
    category:
      (categoryValue ?? null) as CatalogCategory | null,
  };
}

export async function listPricingItems(
  companyId: string,
): Promise<{
  items: CatalogItemWithDetails[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select(
      `
      *,
      unit:units (*),
      category:catalog_categories (*)
    `,
    )
    .eq("company_id", companyId)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return {
      items: [],
      error: error.message,
    };
  }

  return {
    items: (data ?? []).map((row) =>
      normalizeCatalogItem(
        row as unknown as Record<string, unknown>,
      ),
    ),
    error: null,
  };
}

export async function updateCatalogPricing(input: {
  companyId: string;
  itemId: string;
  unitCost: number;
  salePrice: number;
  wastePercentage: number;
  source?: string;
  notes?: string;
}): Promise<{
  error: string | null;
}> {
  // Usar el cast correcto del cliente Supabase tipado.
  // admin_update_catalog_pricing es una función pública de Supabase que opera
  // sobre catalog_items de empresa — no sobre platform_catalog_items.
  const { error } = await supabase.rpc(
    "admin_update_catalog_pricing",
    {
      requested_company_id: input.companyId,
      requested_item_id: input.itemId,
      requested_unit_cost: Math.max(
        input.unitCost,
        0,
      ),
      requested_sale_price: Math.max(
        input.salePrice,
        0,
      ),
      requested_waste_percentage: Math.min(
        Math.max(input.wastePercentage, 0),
        100,
      ),
      change_source:
        input.source?.trim() ||
        "panel_administrativo",
      change_notes:
        input.notes?.trim() || null,
    },
  );

  return {
    error: error?.message ?? null,
  };
}

export async function adjustCatalogPrices(input: {
  companyId: string;
  itemIds: string[];
  target: "unit_cost" | "sale_price";
  percentage: number;
  notes?: string;
}): Promise<{
  error: string | null;
}> {
  if (input.itemIds.length === 0) {
    return {
      error: "No hay elementos para actualizar.",
    };
  }

  if (
    !Number.isFinite(input.percentage) ||
    input.percentage <= -100
  ) {
    return {
      error:
        "El porcentaje debe ser un número mayor que -100.",
    };
  }

  const { error } = await supabase.rpc(
    "admin_adjust_catalog_prices",
    {
      requested_company_id: input.companyId,
      requested_item_ids: input.itemIds,
      requested_target: input.target,
      requested_percentage: input.percentage,
      change_notes:
        input.notes?.trim() || null,
    },
  );

  return {
    error: error?.message ?? null,
  };
}

export async function listPricingHistory(
  companyId: string,
): Promise<{
  history: PricingHistoryItem[];
  error: string | null;
}> {
  // Ordenamos descendente directamente en Supabase para no re-ordenar en el cliente
  const { data, error } = await supabase
    .from("catalog_price_history")
    .select(
      `
      *,
      changed_by_profile:profiles!changed_by (
        id,
        full_name
      ),
      item:catalog_items (
        id,
        name,
        sku,
        active,
        unit:units (
          name,
          symbol
        )
      )
    `,
    )
    .eq("company_id", companyId)
    .order("effective_at", {
      ascending: false,
    })
    .limit(1000);

  if (error) {
    return {
      history: [],
      error: error.message,
    };
  }

  const normalized = (data ?? []).map((row) => {
    const itemValue = Array.isArray(row.item)
      ? row.item[0]
      : row.item;

    const unitValue =
      itemValue && Array.isArray(itemValue.unit)
        ? itemValue.unit[0]
        : itemValue?.unit;

    const actorProfile = Array.isArray(
      (row as Record<string, unknown>).changed_by_profile,
    )
      ? ((row as Record<string, unknown>).changed_by_profile as Array<{ full_name: string | null }>)[0]
      : (row as Record<string, unknown>).changed_by_profile as { full_name: string | null } | null;

    return {
      id: row.id,
      company_id: row.company_id,
      catalog_item_id: row.catalog_item_id,
      unit_cost: row.unit_cost,
      sale_price: row.sale_price,
      // previous_unit_cost y previous_sale_price ya vienen de la BD
      // (columnas añadidas en la migración 20260714010000)
      previous_unit_cost: row.previous_unit_cost ?? null,
      previous_sale_price: row.previous_sale_price ?? null,
      effective_at: row.effective_at,
      created_at: row.created_at,
      changed_by: row.changed_by,
      changed_by_name: row.changed_by
        ? (actorProfile?.full_name ?? "Usuario")
        : "Sistema",
      source: row.source,
      notes: row.notes,
      item: itemValue
        ? {
            id: itemValue.id,
            name: itemValue.name,
            sku: itemValue.sku,
            active: itemValue.active,
            unit: unitValue
              ? {
                  name: unitValue.name,
                  symbol: unitValue.symbol,
                }
              : null,
          }
        : null,
    } satisfies PricingHistoryItem;
  });

  // Ya viene ordenado por effective_at DESC desde Supabase —
  // no se requiere sort adicional en el cliente.
  return {
    history: normalized,
    error: null,
  };
}

export function subscribeToPricing(
  companyId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`admin-pricing:${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "catalog_items",
        filter: `company_id=eq.${companyId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "catalog_price_history",
        filter: `company_id=eq.${companyId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
