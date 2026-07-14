import { supabase } from "@/services/supabase";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemType,
  CatalogItemWithDetails,
  CatalogYield,
  CatalogYieldWithDetails,
  Unit,
} from "@/types/catalog";

export async function listCatalogItems(
  companyId: string,
): Promise<{
  items: CatalogItemWithDetails[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("effective_platform_catalog_prices")
    .select("*")
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

  const items: CatalogItemWithDetails[] = (data ?? [])
    .filter(
      (row): row is typeof row & { id: string; name: string } =>
        Boolean(row.id && row.name),
    )
    .map((row) => {
      const timestamp = row.updated_at ?? new Date(0).toISOString();
      const unit: Unit = {
        id: `platform-unit:${row.unit_symbol ?? "und"}`,
        company_id: companyId,
        code: row.unit_symbol ?? "und",
        name: row.unit_name ?? "Unidad",
        symbol: row.unit_symbol ?? "und.",
        unit_type: "unit",
        conversion_factor: 1,
        active: true,
        created_at: timestamp,
        updated_at: timestamp,
      };
      const category: CatalogCategory | null = row.category_name
        ? {
            id: `platform-category:${row.category_name}`,
            company_id: companyId,
            parent_id: null,
            name: row.category_name,
            description: null,
            active: true,
            created_at: timestamp,
            updated_at: timestamp,
          }
        : null;

      return {
        id: row.id,
        company_id: companyId,
        item_type: row.item_type ?? "material",
        category_id: category?.id ?? null,
        sku: row.sku,
        name: row.name,
        description: row.description,
        unit_id: unit.id,
        unit_cost: Number(row.unit_cost ?? 0),
        sale_price: Number(row.sale_price ?? 0),
        waste_percentage: Number(row.waste_percentage ?? 0),
        default_unit_cost: Number(row.default_unit_cost ?? 0),
        default_sale_price: Number(row.default_sale_price ?? 0),
        default_waste_percentage: Number(
          row.default_waste_percentage ?? 0,
        ),
        has_override: Boolean(row.has_override),
        active: Boolean(row.active),
        created_at: timestamp,
        updated_at: timestamp,
        unit,
        category,
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

  const { error } = await supabase.rpc(
    "set_personal_catalog_pricing",
    {
      requested_item_id: input.itemId,
      requested_unit_cost: unitCost,
      requested_sale_price: salePrice,
      requested_waste_percentage: wastePercentage,
    },
  );

  return {
    error: error?.message ?? null,
  };
}

export async function resetCatalogItemPricing(input: {
  itemId: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(
    "reset_personal_catalog_pricing",
    { requested_item_id: input.itemId },
  );

  return { error: error?.message ?? null };
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

export async function listCatalogYields(input: {
  companyId: string;
  catalogItemId: string;
}): Promise<{
  yields: CatalogYieldWithDetails[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("catalog_yields")
    .select(`
      *,
      output_unit:units (*)
    `)
    .eq("company_id", input.companyId)
    .eq("catalog_item_id", input.catalogItemId)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    return {
      yields: [],
      error: error.message,
    };
  }

  const yields = (data ?? []).map((row) => {
    const outputUnit = Array.isArray(row.output_unit)
      ? row.output_unit[0]
      : row.output_unit;

    return {
      ...(row as CatalogYield),
      output_unit: (outputUnit ?? null) as Unit | null,
    };
  });

  return {
    yields,
    error: null,
  };
}

export async function createCatalogYield(input: {
  companyId: string;
  catalogItemId: string;
  outputUnitId: string;
  name: string;
  outputQuantity: number;
  laborHours: number;
  crewSize: number;
  wastePercentage?: number;
  notes?: string;
}): Promise<{
  yield: CatalogYield | null;
  error: string | null;
}> {
  const name = input.name.trim();

  if (name.length < 2) {
    return {
      yield: null,
      error: "Introduce un nombre de rendimiento válido.",
    };
  }

  if (!input.outputUnitId) {
    return {
      yield: null,
      error: "Selecciona la unidad de producción.",
    };
  }

  if (input.outputQuantity <= 0) {
    return {
      yield: null,
      error: "La producción debe ser mayor que cero.",
    };
  }

  if (input.laborHours < 0 || input.crewSize <= 0) {
    return {
      yield: null,
      error: "Revisa las horas y el tamaño de la cuadrilla.",
    };
  }

  const { data, error } = await supabase
    .from("catalog_yields")
    .insert({
      company_id: input.companyId,
      catalog_item_id: input.catalogItemId,
      output_unit_id: input.outputUnitId,
      name,
      output_quantity: input.outputQuantity,
      labor_hours: input.laborHours,
      crew_size: input.crewSize,
      waste_percentage: Math.min(
        Math.max(input.wastePercentage ?? 0, 0),
        100,
      ),
      notes: input.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return {
      yield: null,
      error: error.message,
    };
  }

  return {
    yield: data,
    error: null,
  };
}

export async function deactivateCatalogYield(input: {
  companyId: string;
  yieldId: string;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("catalog_yields")
    .update({ active: false })
    .eq("company_id", input.companyId)
    .eq("id", input.yieldId);

  return {
    error: error?.message ?? null,
  };
}

