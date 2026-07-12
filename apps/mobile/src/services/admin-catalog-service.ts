import { supabase } from "@/services/supabase";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemType,
  CatalogItemWithDetails,
  Unit,
} from "@/types/catalog";

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

export async function listAdminCatalogItems(
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
    .order("active", { ascending: false })
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

export async function getAdminCatalogItem(input: {
  companyId: string;
  itemId: string;
}): Promise<{
  item: CatalogItemWithDetails | null;
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
    .eq("company_id", input.companyId)
    .eq("id", input.itemId)
    .maybeSingle();

  if (error) {
    return {
      item: null,
      error: error.message,
    };
  }

  return {
    item: data
      ? normalizeCatalogItem(
          data as unknown as Record<string, unknown>,
        )
      : null,
    error: null,
  };
}

export async function updateAdminCatalogItem(input: {
  companyId: string;
  itemId: string;
  itemType: CatalogItemType;
  categoryId?: string | null;
  sku?: string;
  name: string;
  description?: string;
  unitId: string;
  unitCost: number;
  salePrice: number;
  wastePercentage: number;
}): Promise<{
  item: CatalogItem | null;
  error: string | null;
}> {
  const name = input.name.trim();

  if (name.length < 2) {
    return {
      item: null,
      error: "Introduce un nombre válido.",
    };
  }

  if (!input.unitId) {
    return {
      item: null,
      error: "Selecciona una unidad.",
    };
  }

  const unitCost = Math.max(input.unitCost, 0);
  const salePrice = Math.max(input.salePrice, 0);
  const wastePercentage = Math.min(
    Math.max(input.wastePercentage, 0),
    100,
  );

  const { data, error } = await supabase
    .from("catalog_items")
    .update({
      item_type: input.itemType,
      category_id: input.categoryId ?? null,
      sku: input.sku?.trim() || null,
      name,
      description: input.description?.trim() || null,
      unit_id: input.unitId,
      unit_cost: unitCost,
      sale_price: salePrice,
      waste_percentage: wastePercentage,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", input.companyId)
    .eq("id", input.itemId)
    .select("*")
    .single();

  if (error) {
    return {
      item: null,
      error: error.message,
    };
  }

  return {
    item: data,
    error: null,
  };
}

export async function setAdminCatalogItemActive(input: {
  companyId: string;
  itemId: string;
  active: boolean;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("catalog_items")
    .update({
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", input.companyId)
    .eq("id", input.itemId);

  return {
    error: error?.message ?? null,
  };
}

export async function listAdminCatalogCategories(
  companyId: string,
): Promise<{
  categories: CatalogCategory[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("catalog_categories")
    .select("*")
    .eq("company_id", companyId)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  return {
    categories: error ? [] : data,
    error: error?.message ?? null,
  };
}

export async function updateAdminCatalogCategory(input: {
  companyId: string;
  categoryId: string;
  name: string;
  description?: string;
}): Promise<{
  category: CatalogCategory | null;
  error: string | null;
}> {
  const name = input.name.trim();

  if (name.length < 2) {
    return {
      category: null,
      error: "Introduce un nombre de categoría válido.",
    };
  }

  const { data, error } = await supabase
    .from("catalog_categories")
    .update({
      name,
      description: input.description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", input.companyId)
    .eq("id", input.categoryId)
    .select("*")
    .single();

  if (error) {
    return {
      category: null,
      error: error.message,
    };
  }

  return {
    category: data,
    error: null,
  };
}

export async function setAdminCatalogCategoryActive(input: {
  companyId: string;
  categoryId: string;
  active: boolean;
}): Promise<{
  error: string | null;
}> {
  if (!input.active) {
    const { count, error: countError } = await supabase
      .from("catalog_items")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("company_id", input.companyId)
      .eq("category_id", input.categoryId)
      .eq("active", true);

    if (countError) {
      return {
        error: countError.message,
      };
    }

    if ((count ?? 0) > 0) {
      return {
        error:
          "Esta categoría contiene elementos activos. Muévelos o desactívalos antes.",
      };
    }
  }

  const { error } = await supabase
    .from("catalog_categories")
    .update({
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", input.companyId)
    .eq("id", input.categoryId);

  return {
    error: error?.message ?? null,
  };
}

export function subscribeToAdminCatalog(
  companyId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`admin-catalog:${companyId}`)
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
        table: "catalog_categories",
        filter: `company_id=eq.${companyId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "units",
        filter: `company_id=eq.${companyId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
