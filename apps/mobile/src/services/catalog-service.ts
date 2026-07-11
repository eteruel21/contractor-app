import { supabase } from "@/services/supabase";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemType,
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
export async function listCatalogUnits(
  companyId: string,
): Promise<{
  units: Unit[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("company_id", companyId)
    .eq("active", true)
    .order("name", { ascending: true });

  return {
    units: error ? [] : data,
    error: error?.message ?? null,
  };
}

export async function listCatalogCategories(
  companyId: string,
): Promise<{
  categories: CatalogCategory[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("catalog_categories")
    .select("*")
    .eq("company_id", companyId)
    .eq("active", true)
    .order("name", { ascending: true });

  return {
    categories: error ? [] : data,
    error: error?.message ?? null,
  };
}

export async function createCatalogItem(input: {
  companyId: string;
  itemType: CatalogItemType;
  categoryId?: string | null;
  sku?: string;
  name: string;
  description?: string;
  unitId: string;
  unitCost?: number;
  salePrice?: number;
  wastePercentage?: number;
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

  const unitCost = Math.max(input.unitCost ?? 0, 0);
  const salePrice = Math.max(input.salePrice ?? 0, 0);
  const wastePercentage = Math.min(
    Math.max(input.wastePercentage ?? 0, 0),
    100,
  );

  const { data, error } = await supabase
    .from("catalog_items")
    .insert({
      company_id: input.companyId,
      item_type: input.itemType,
      category_id: input.categoryId ?? null,
      sku: input.sku?.trim() || null,
      name,
      description: input.description?.trim() || null,
      unit_id: input.unitId,
      unit_cost: unitCost,
      sale_price: salePrice,
      waste_percentage: wastePercentage,
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
    item: data,
    error: null,
  };
}

export async function createCatalogCategory(input: {
  companyId: string;
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
    .insert({
      company_id: input.companyId,
      name,
      description: input.description?.trim() || null,
    })
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

export async function deactivateCatalogCategory(input: {
  companyId: string;
  categoryId: string;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("catalog_categories")
    .update({ active: false })
    .eq("company_id", input.companyId)
    .eq("id", input.categoryId);

  return {
    error: error?.message ?? null,
  };
}


