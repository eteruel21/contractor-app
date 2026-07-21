import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type {
  createItemSchema,
  createCategorySchema,
  createYieldSchema,
  pricingSchema
} from "./schemas.js";

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateYieldInput = z.infer<typeof createYieldSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;

export async function findPlatformCatalogItems(userId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(`
      SELECT *
      FROM public.effective_platform_catalog_prices
      WHERE active = true
      ORDER BY name ASC
    `);
    return result.rows;
  });
}

export async function setPersonalCatalogPricingRepo(userId: string, itemId: string, input: PricingInput) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        SELECT public.set_personal_catalog_pricing(
          $1, $2, $3, $4
        )
      `,
      [itemId, input.unitCost, input.salePrice, input.wastePercentage]
    );
  });
}

export async function resetPersonalCatalogPricingRepo(userId: string, itemId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        SELECT public.reset_personal_catalog_pricing($1)
      `,
      [itemId]
    );
  });
}

export async function deactivateCatalogItemRepo(userId: string, itemId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.catalog_items
        SET active = false, updated_at = now()
        WHERE id = $1 AND company_id = $2
      `,
      [itemId, companyId]
    );
  });
}

export async function findCatalogUnits(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.units
        WHERE company_id = $1 AND active = true
        ORDER BY name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function findCatalogCategories(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.catalog_categories
        WHERE company_id = $1 AND active = true
        ORDER BY name ASC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function createCatalogItemRepo(userId: string, input: CreateItemInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.catalog_items (
          company_id, item_type, category_id, sku, name, description, unit_id, unit_cost, sale_price, waste_percentage
        )
        VALUES (
          $1, $2::public.catalog_item_type, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *
      `,
      [
        input.companyId,
        input.itemType,
        input.categoryId ?? null,
        input.sku || null,
        input.name,
        input.description || null,
        input.unitId,
        input.unitCost,
        input.salePrice,
        input.wastePercentage
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function createCatalogCategoryRepo(userId: string, input: CreateCategoryInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.catalog_categories (
          company_id, name, description
        )
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [input.companyId, input.name, input.description || null]
    );
    return result.rows[0] ?? null;
  });
}

export async function deactivateCatalogCategoryRepo(userId: string, categoryId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.catalog_categories
        SET active = false, updated_at = now()
        WHERE id = $1 AND company_id = $2
      `,
      [categoryId, companyId]
    );
  });
}

export async function findCatalogYieldsRepo(userId: string, companyId: string, catalogItemId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT
          catalog_yield.*,
          CASE
            WHEN output_unit.id IS NULL THEN NULL
            ELSE jsonb_build_object(
              'id', output_unit.id,
              'company_id', output_unit.company_id,
              'code', output_unit.code,
              'name', output_unit.name,
              'symbol', output_unit.symbol,
              'unit_type', output_unit.unit_type,
              'conversion_factor', output_unit.conversion_factor,
              'active', output_unit.active,
              'created_at', output_unit.created_at,
              'updated_at', output_unit.updated_at
            )
          END AS output_unit
        FROM public.catalog_yields AS catalog_yield
        LEFT JOIN public.units AS output_unit ON output_unit.id = catalog_yield.output_unit_id
        WHERE catalog_yield.company_id = $1
          AND catalog_yield.catalog_item_id = $2
          AND catalog_yield.active = true
        ORDER BY catalog_yield.name ASC
      `,
      [companyId, catalogItemId]
    );
    return result.rows;
  });
}

export async function createCatalogYieldRepo(userId: string, input: CreateYieldInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.catalog_yields (
          company_id, catalog_item_id, output_unit_id, name, output_quantity, labor_hours, crew_size, waste_percentage, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

export async function deactivateCatalogYieldRepo(userId: string, yieldId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.catalog_yields
        SET active = false, updated_at = now()
        WHERE id = $1 AND company_id = $2
      `,
      [yieldId, companyId]
    );
  });
}
