import {
  authenticatedRequest
} from "@/services/api";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemType,
  CatalogItemWithDetails,
  CatalogYield,
  CatalogYieldWithDetails,
  Unit
} from "@/types/catalog";

type EffectiveCatalogRow = {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  item_type: CatalogItemType | null;
  unit_cost: number | string | null;
  sale_price: number | string | null;
  waste_percentage: number | string | null;
  default_unit_cost: number | string | null;
  default_sale_price: number | string | null;
  default_waste_percentage:
    | number
    | string
    | null;
  has_override: boolean | null;
  active: boolean | null;
  unit_symbol: string | null;
  unit_name: string | null;
  category_name: string | null;
  updated_at: string | null;
};

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listCatalogItems(
  companyId: string
): Promise<{
  items: CatalogItemWithDetails[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        items: EffectiveCatalogRow[];
      }>("/catalog/items");

    const items =
      response.items.map((row) => {
        const timestamp =
          row.updated_at ??
          new Date(0).toISOString();

        const unit: Unit = {
          id:
            `platform-unit:${row.unit_symbol ?? "und"}`,
          company_id: companyId,
          code: row.unit_symbol ?? "und",
          name: row.unit_name ?? "Unidad",
          symbol:
            row.unit_symbol ?? "und.",
          unit_type: "unit",
          conversion_factor: 1,
          active: true,
          created_at: timestamp,
          updated_at: timestamp
        };

        const category:
          | CatalogCategory
          | null =
          row.category_name
            ? {
                id:
                  `platform-category:${row.category_name}`,
                company_id: companyId,
                parent_id: null,
                name: row.category_name,
                description: null,
                active: true,
                created_at: timestamp,
                updated_at: timestamp
              }
            : null;

        return {
          id: row.id,
          company_id: companyId,
          item_type:
            row.item_type ?? "material",
          category_id:
            category?.id ?? null,
          sku: row.sku,
          name: row.name,
          description: row.description,
          unit_id: unit.id,
          unit_cost:
            Number(row.unit_cost ?? 0),
          sale_price:
            Number(row.sale_price ?? 0),
          waste_percentage:
            Number(
              row.waste_percentage ?? 0
            ),
          default_unit_cost:
            Number(
              row.default_unit_cost ?? 0
            ),
          default_sale_price:
            Number(
              row.default_sale_price ?? 0
            ),
          default_waste_percentage:
            Number(
              row.default_waste_percentage ??
                0
            ),
          has_override:
            Boolean(row.has_override),
          active: Boolean(row.active),
          created_at: timestamp,
          updated_at: timestamp,
          unit,
          category
        };
      });

    return {
      items,
      error: null
    };
  } catch (error) {
    return {
      items: [],
      error: errorMessage(error)
    };
  }
}

export async function updateCatalogItemPricing(
  input: {
    companyId: string;
    itemId: string;
    unitCost: number;
    salePrice: number;
    wastePercentage: number;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/catalog/items/${input.itemId}/pricing`,
      {
        method: "PATCH",
        body: JSON.stringify({
          unitCost:
            Math.max(input.unitCost, 0),
          salePrice:
            Math.max(input.salePrice, 0),
          wastePercentage:
            Math.min(
              Math.max(
                input.wastePercentage,
                0
              ),
              100
            )
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

export async function resetCatalogItemPricing(
  input: {
    itemId: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/catalog/items/${input.itemId}/pricing`,
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

export async function deactivateCatalogItem(
  input: {
    companyId: string;
    itemId: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/catalog/items/${input.itemId}/deactivate`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId: input.companyId
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

export async function listCatalogUnits(
  companyId: string
): Promise<{
  units: Unit[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        units: Unit[];
      }>(
        `/catalog/units?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      units: response.units,
      error: null
    };
  } catch (error) {
    return {
      units: [],
      error: errorMessage(error)
    };
  }
}

export async function listCatalogCategories(
  companyId: string
): Promise<{
  categories: CatalogCategory[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        categories: CatalogCategory[];
      }>(
        `/catalog/categories?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      categories:
        response.categories,
      error: null
    };
  } catch (error) {
    return {
      categories: [],
      error: errorMessage(error)
    };
  }
}

export async function createCatalogItem(
  input: {
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
  }
): Promise<{
  item: CatalogItem | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        item: CatalogItem;
      }>(
        "/catalog/items",
        {
          method: "POST",
          body: JSON.stringify({
            companyId: input.companyId,
            itemType: input.itemType,
            categoryId:
              input.categoryId ?? null,
            sku: input.sku,
            name: input.name.trim(),
            description:
              input.description?.trim(),
            unitId: input.unitId,
            unitCost:
              Math.max(
                input.unitCost ?? 0,
                0
              ),
            salePrice:
              Math.max(
                input.salePrice ?? 0,
                0
              ),
            wastePercentage:
              Math.min(
                Math.max(
                  input.wastePercentage ??
                    0,
                  0
                ),
                100
              )
          })
        }
      );

    return {
      item: response.item,
      error: null
    };
  } catch (error) {
    return {
      item: null,
      error: errorMessage(error)
    };
  }
}

export async function createCatalogCategory(
  input: {
    companyId: string;
    name: string;
    description?: string;
  }
): Promise<{
  category: CatalogCategory | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        category: CatalogCategory;
      }>(
        "/catalog/categories",
        {
          method: "POST",
          body: JSON.stringify({
            companyId: input.companyId,
            name: input.name.trim(),
            description:
              input.description?.trim()
          })
        }
      );

    return {
      category: response.category,
      error: null
    };
  } catch (error) {
    return {
      category: null,
      error: errorMessage(error)
    };
  }
}

export async function deactivateCatalogCategory(
  input: {
    companyId: string;
    categoryId: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/catalog/categories/${input.categoryId}/deactivate`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId: input.companyId
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

export async function listCatalogYields(
  input: {
    companyId: string;
    catalogItemId: string;
  }
): Promise<{
  yields: CatalogYieldWithDetails[];
  error: string | null;
}> {
  try {
    const query =
      new URLSearchParams({
        companyId: input.companyId,
        catalogItemId:
          input.catalogItemId
      }).toString();

    const response =
      await authenticatedRequest<{
        yields:
          (CatalogYield & {
              output_unit:
                | Unit
                | null;
            })[];
      }>(
        `/catalog/yields?${query}`
      );

    const yields =
      response.yields.map(
        (row) => ({
          ...row,
          output_quantity:
            Number(
              row.output_quantity ?? 0
            ),
          labor_hours:
            Number(
              row.labor_hours ?? 0
            ),
          crew_size:
            Number(
              row.crew_size ?? 0
            ),
          waste_percentage:
            Number(
              row.waste_percentage ?? 0
            ),
          output_unit:
            row.output_unit ?? null
        })
      );

    return {
      yields,
      error: null
    };
  } catch (error) {
    return {
      yields: [],
      error: errorMessage(error)
    };
  }
}

export async function createCatalogYield(
  input: {
    companyId: string;
    catalogItemId: string;
    outputUnitId: string;
    name: string;
    outputQuantity: number;
    laborHours: number;
    crewSize: number;
    wastePercentage?: number;
    notes?: string;
  }
): Promise<{
  yield: CatalogYield | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        yield: CatalogYield;
      }>(
        "/catalog/yields",
        {
          method: "POST",
          body: JSON.stringify({
            ...input,
            name: input.name.trim(),
            wastePercentage:
              Math.min(
                Math.max(
                  input.wastePercentage ??
                    0,
                  0
                ),
                100
              ),
            notes:
              input.notes?.trim()
          })
        }
      );

    return {
      yield: response.yield,
      error: null
    };
  } catch (error) {
    return {
      yield: null,
      error: errorMessage(error)
    };
  }
}

export async function deactivateCatalogYield(
  input: {
    companyId: string;
    yieldId: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/catalog/yields/${input.yieldId}/deactivate`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId: input.companyId
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