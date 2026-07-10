import { supabase } from "@/services/supabase";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemWithDetails,
  Unit,
} from "@/types/catalog";

export async function listCatalogItems(
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
    .order("name", {
      ascending: true,
    });

  if (error) {
    return {
      items: [],
      error: error.message,
    };
  }

  const items = (data ?? []).map((row) => {
    const unitValue = Array.isArray(row.unit)
      ? row.unit[0]
      : row.unit;

    const categoryValue = Array.isArray(row.category)
      ? row.category[0]
      : row.category;

    return {
      ...(row as CatalogItem),
      unit: (unitValue ?? null) as Unit | null,
      category:
        (categoryValue ?? null) as CatalogCategory | null,
    };
  });

  return {
    items,
    error: null,
  };
}

export async function updateCatalogItemPricing(input: {
  companyId: string;
  itemId: string;
  unitCost: number;
  salePrice: number;
  wastePercentage: number;
}): Promise<{
  error: string | null;
}> {
  const unitCost = Math.max(input.unitCost, 0);
  const salePrice = Math.max(input.salePrice, 0);
  const wastePercentage = Math.min(
    Math.max(input.wastePercentage, 0),
    100,
  );

  const { error } = await supabase
    .from("catalog_items")
    .update({
      unit_cost: unitCost,
      sale_price: salePrice,
      waste_percentage: wastePercentage,
    })
    .eq("company_id", input.companyId)
    .eq("id", input.itemId);

  return {
    error: error?.message ?? null,
  };
}

export async function deactivateCatalogItem(input: {
  companyId: string;
  itemId: string;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("catalog_items")
    .update({
      active: false,
    })
    .eq("company_id", input.companyId)
    .eq("id", input.itemId);

  return {
    error: error?.message ?? null,
  };
}