import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type {
  adminCatalogItemSchema,
  categorySchema,
  formulaSchema,
  unitSchema,
  pricingSchema,
  pricingAdjustmentSchema
} from "./schemas.js";

export type AdminCatalogItemInput = z.infer<typeof adminCatalogItemSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type FormulaInput = z.infer<typeof formulaSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;
export type PricingAdjustmentInput = z.infer<typeof pricingAdjustmentSchema>;

const catalogItemDetailsSql = `
  SELECT
    item.*,
    CASE WHEN unit.id IS NULL THEN NULL ELSE to_jsonb(unit) END AS unit,
    CASE WHEN category.id IS NULL THEN NULL ELSE to_jsonb(category) END AS category
  FROM public.catalog_items AS item
  LEFT JOIN public.units AS unit ON unit.id = item.unit_id
  LEFT JOIN public.catalog_categories AS category ON category.id = item.category_id
`;

export async function findAdminCatalogItemsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${catalogItemDetailsSql}
        WHERE item.company_id = $1
        ORDER BY item.active DESC, item.name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function findAdminCatalogItemByIdRepo(userId: string, itemId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${catalogItemDetailsSql}
        WHERE item.id = $1 AND item.company_id = $2
        LIMIT 1
      `,
      [itemId, companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateAdminCatalogItemRepo(userId: string, itemId: string, input: AdminCatalogItemInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.catalog_items
        SET
          item_type = $1::public.catalog_item_type,
          category_id = $2,
          sku = $3,
          name = $4,
          description = $5,
          unit_id = $6,
          unit_cost = $7,
          sale_price = $8,
          waste_percentage = $9,
          updated_at = now()
        WHERE id = $10 AND company_id = $11
        RETURNING *
      `,
      [
        input.itemType,
        input.categoryId ?? null,
        input.sku || null,
        input.name,
        input.description || null,
        input.unitId,
        input.unitCost,
        input.salePrice,
        input.wastePercentage,
        itemId,
        input.companyId
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function setCatalogItemActiveRepo(userId: string, itemId: string, companyId: string, active: boolean) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.catalog_items
        SET active = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3
      `,
      [active, itemId, companyId]
    );
  });
}

export async function findAdminCategoriesRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.catalog_categories
        WHERE company_id = $1
        ORDER BY active DESC, name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function updateAdminCategoryRepo(userId: string, categoryId: string, input: CategoryInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.catalog_categories
        SET name = $1, description = $2, updated_at = now()
        WHERE id = $3 AND company_id = $4
        RETURNING *
      `,
      [input.name, input.description || null, categoryId, input.companyId]
    );
    return result.rows[0] ?? null;
  });
}

export async function setCategoryActiveRepo(userId: string, categoryId: string, companyId: string, active: boolean) {
  return withUserTransaction(userId, async (client) => {
    if (!active) {
      const countResult = await client.query<{ total: string }>(
        `
          SELECT count(*) AS total
          FROM public.catalog_items
          WHERE company_id = $1 AND category_id = $2 AND active = true
        `,
        [companyId, categoryId]
      );
      if (Number(countResult.rows[0]?.total ?? 0) > 0) {
        return { blocked: true };
      }
    }

    await client.query(
      `
        UPDATE public.catalog_categories
        SET active = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3
      `,
      [active, categoryId, companyId]
    );

    return { blocked: false };
  });
}

export async function findAdminFormulasRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.catalog_yields
        WHERE company_id = $1
        ORDER BY active DESC, name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function findFormulaItemsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT id, name, item_type, active
        FROM public.catalog_items
        WHERE company_id = $1
        ORDER BY active DESC, name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function findFormulaUnitsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.units
        WHERE company_id = $1
        ORDER BY active DESC, name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function createAdminFormulaRepo(userId: string, input: FormulaInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.catalog_yields (
          company_id, catalog_item_id, output_unit_id, name, output_quantity, labor_hours, crew_size, waste_percentage, notes, active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
        RETURNING *
      `,
      [
        input.companyId,
        input.catalogItemId,
        input.outputUnitId,
        input.name,
        input.outputQuantity,
        input.laborHours,
        input.crewSize,
        input.wastePercentage,
        input.notes || null
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateAdminFormulaRepo(userId: string, formulaId: string, input: FormulaInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.catalog_yields
        SET
          catalog_item_id = $1,
          output_unit_id = $2,
          name = $3,
          output_quantity = $4,
          labor_hours = $5,
          crew_size = $6,
          waste_percentage = $7,
          notes = $8,
          updated_at = now()
        WHERE id = $9 AND company_id = $10
        RETURNING *
      `,
      [
        input.catalogItemId,
        input.outputUnitId,
        input.name,
        input.outputQuantity,
        input.laborHours,
        input.crewSize,
        input.wastePercentage,
        input.notes || null,
        formulaId,
        input.companyId
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function setFormulaActiveRepo(userId: string, formulaId: string, companyId: string, active: boolean) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.catalog_yields
        SET active = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3
      `,
      [active, formulaId, companyId]
    );
  });
}

export async function getRuntimeFormulaParametersRepo(userId: string, companyId: string, formulaCode: string) {
  const normalizedCode = formulaCode
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return withUserTransaction(userId, async (client) => {
    const formulaResult = await client.query<{ id: string }>(
      `
        SELECT id
        FROM public.calculation_formulas
        WHERE company_id = $1 AND code = $2 AND active = true
        LIMIT 1
      `,
      [companyId, normalizedCode]
    );

    const formula = formulaResult.rows[0];
    if (!formula) return null;

    const result = await client.query<{ parameter_key: string; numeric_value: number | string | null }>(
      `
        SELECT parameter_key, numeric_value
        FROM public.calculation_formula_parameters
        WHERE company_id = $1 AND formula_id = $2 AND active = true
      `,
      [companyId, formula.id]
    );

    const output: Record<string, number> = {};
    for (const row of result.rows) {
      const numericValue = Number(row.numeric_value);
      if (Number.isFinite(numericValue)) {
        output[row.parameter_key] = numericValue;
      }
    }
    return output;
  });
}

export async function findMeasurementUnitsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.units
        WHERE company_id = $1
        ORDER BY unit_type ASC, name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function createMeasurementUnitRepo(userId: string, input: UnitInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.units (
          company_id, code, name, symbol, unit_type, conversion_factor, active
        )
        VALUES ($1, $2, $3, $4, $5::public.unit_type, $6, true)
        RETURNING *
      `,
      [
        input.companyId,
        input.code.toLowerCase(),
        input.name,
        input.symbol,
        input.unitType,
        input.conversionFactor
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateMeasurementUnitRepo(userId: string, unitId: string, input: UnitInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.units
        SET
          code = $1,
          name = $2,
          symbol = $3,
          unit_type = $4::public.unit_type,
          conversion_factor = $5,
          updated_at = now()
        WHERE id = $6 AND company_id = $7
        RETURNING *
      `,
      [
        input.code.toLowerCase(),
        input.name,
        input.symbol,
        input.unitType,
        input.conversionFactor,
        unitId,
        input.companyId
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function setMeasurementUnitActiveRepo(userId: string, unitId: string, companyId: string, active: boolean) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.units
        SET active = $1, updated_at = now()
        WHERE id = $2 AND company_id = $3
      `,
      [active, unitId, companyId]
    );
  });
}

export async function findPricingItemsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${catalogItemDetailsSql}
        WHERE item.company_id = $1 AND item.active = true
        ORDER BY item.name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function updateItemPricingRepo(userId: string, itemId: string, input: PricingInput) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        SELECT public.admin_update_catalog_pricing(
          $1, $2, $3, $4, $5, $6, $7
        )
      `,
      [
        input.companyId,
        itemId,
        input.unitCost,
        input.salePrice,
        input.wastePercentage,
        input.source,
        input.notes || null
      ]
    );
  });
}

export async function adjustPricingRepo(userId: string, input: PricingAdjustmentInput) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        SELECT public.admin_adjust_catalog_prices(
          $1, $2::uuid[], $3, $4, $5
        )
      `,
      [
        input.companyId,
        input.itemIds,
        input.target,
        input.percentage,
        input.notes || null
      ]
    );
  });
}

export async function findPricingHistoryRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          history.id,
          history.company_id,
          history.catalog_item_id,
          history.unit_cost,
          history.sale_price,
          history.previous_unit_cost,
          history.previous_sale_price,
          history.effective_at,
          history.created_at,
          history.changed_by,
          COALESCE(
            profile.full_name,
            CASE WHEN history.changed_by IS NULL THEN 'Sistema' ELSE 'Usuario' END
          ) AS changed_by_name,
          history.source,
          history.notes,
          CASE
            WHEN item.id IS NULL THEN NULL
            ELSE jsonb_build_object(
              'id', item.id,
              'name', item.name,
              'sku', item.sku,
              'active', item.active,
              'unit', CASE WHEN unit.id IS NULL THEN NULL ELSE jsonb_build_object('name', unit.name, 'symbol', unit.symbol) END
            )
          END AS item
        FROM public.catalog_price_history AS history
        LEFT JOIN public.profiles AS profile ON profile.id = history.changed_by
        LEFT JOIN public.catalog_items AS item ON item.id = history.catalog_item_id
        LEFT JOIN public.units AS unit ON unit.id = item.unit_id
        WHERE history.company_id = $1
        ORDER BY history.effective_at DESC
        LIMIT 1000
      `,
      [companyId]
    );
    return result.rows;
  });
}
