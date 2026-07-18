import {
  authenticatedRequest
} from "@/services/api";
import {
  createPollingSubscription
} from "@/services/polling-service";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemType,
  CatalogItemWithDetails,
  Unit
} from "@/types/catalog";

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

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listAdminCatalogItems(
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
        `/admin/catalog/items?companyId=${encodeURIComponent(companyId)}`
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

export async function getAdminCatalogItem(
  input: {
    companyId: string;
    itemId: string;
  }
): Promise<{
  item: CatalogItemWithDetails | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        item: CatalogItemRow | null;
      }>(
        `/admin/catalog/items/${input.itemId}?companyId=${encodeURIComponent(input.companyId)}`
      );

    return {
      item: response.item
        ? normalizeCatalogItem(
            response.item
          )
        : null,
      error: null
    };
  } catch (error) {
    return {
      item: null,
      error: errorMessage(error)
    };
  }
}

export async function updateAdminCatalogItem(
  input: {
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
        `/admin/catalog/items/${input.itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            companyId:
              input.companyId,
            itemType:
              input.itemType,
            categoryId:
              input.categoryId ?? null,
            sku:
              input.sku?.trim() || "",
            name:
              input.name.trim(),
            description:
              input.description?.trim() ||
              "",
            unitId:
              input.unitId,
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

export async function setAdminCatalogItemActive(
  input: {
    companyId: string;
    itemId: string;
    active: boolean;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/admin/catalog/items/${input.itemId}/active`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId:
            input.companyId,
          active:
            input.active
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

export async function listAdminCatalogCategories(
  companyId: string
): Promise<{
  categories: CatalogCategory[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        categories:
          CatalogCategory[];
      }>(
        `/admin/catalog/categories?companyId=${encodeURIComponent(companyId)}`
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

export async function updateAdminCatalogCategory(
  input: {
    companyId: string;
    categoryId: string;
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
        `/admin/catalog/categories/${input.categoryId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            companyId:
              input.companyId,
            name:
              input.name.trim(),
            description:
              input.description?.trim() ||
              ""
          })
        }
      );

    return {
      category:
        response.category,
      error: null
    };
  } catch (error) {
    return {
      category: null,
      error: errorMessage(error)
    };
  }
}

export async function setAdminCatalogCategoryActive(
  input: {
    companyId: string;
    categoryId: string;
    active: boolean;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/admin/catalog/categories/${input.categoryId}/active`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId:
            input.companyId,
          active:
            input.active
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

export function subscribeToAdminCatalog(
  _companyId: string,
  onChange: () => void
): () => void {
  return createPollingSubscription(
    onChange,
    15000
  );
}