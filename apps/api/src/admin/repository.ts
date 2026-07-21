import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type {
  userSchema,
  categorySchema,
  itemSchema,
  unitSchema,
  yieldSchema,
  formulaSchema,
  globalPriceSchema,
  adjustPricesSchema
} from "./schemas.ts";

export type UserInput = z.infer<typeof userSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ItemInput = z.infer<typeof itemSchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type YieldInput = z.infer<typeof yieldSchema>;
export type FormulaInput = z.infer<typeof formulaSchema>;
export type GlobalPriceInput = z.infer<typeof globalPriceSchema>;
export type AdjustPricesInput = z.infer<typeof adjustPricesSchema>;

export async function getAdminDashboardDataRepo(userId: string) {
  return withUserTransaction(userId, async (client) => {
    const users = await client.query(`
      SELECT
        profile.id,
        COALESCE(profile.full_name, '') AS full_name,
        COALESCE(profile.phone, '') AS phone,
        profile.role,
        profile.active,
        profile.approved_at,
        profile.approved_by,
        profile.created_at,
        COALESCE(
          (
            SELECT company.name
            FROM public.company_members AS membership
            JOIN public.companies AS company ON company.id = membership.company_id
            WHERE membership.user_id = profile.id
            ORDER BY membership.active DESC, company.name ASC
            LIMIT 1
          ),
          'Sin empresa'
        ) AS company_name
      FROM public.profiles AS profile
      ORDER BY profile.active ASC, profile.created_at DESC
    `);

    const companies = await client.query(`
      SELECT id, name, active
      FROM public.companies
      ORDER BY name ASC
    `);

    const categories = await client.query(`
      SELECT
        category.id,
        category.company_id,
        company.name AS company_name,
        category.name,
        COALESCE(category.description, '') AS description,
        category.active
      FROM public.catalog_categories AS category
      LEFT JOIN public.companies AS company ON company.id = category.company_id
      ORDER BY category.name ASC
    `);

    const items = await client.query(`
      SELECT
        item.id,
        item.company_id,
        company.name AS company_name,
        COALESCE(item.sku, '') AS sku,
        item.name,
        COALESCE(item.description, '') AS description,
        item.item_type,
        item.category_id,
        COALESCE(category.name, 'Sin categoría') AS category_name,
        item.unit_id,
        COALESCE(unit.symbol, '—') AS unit_symbol,
        item.unit_cost,
        item.sale_price,
        item.waste_percentage,
        item.active
      FROM public.catalog_items AS item
      LEFT JOIN public.companies AS company ON company.id = item.company_id
      LEFT JOIN public.catalog_categories AS category ON category.id = item.category_id
      LEFT JOIN public.units AS unit ON unit.id = item.unit_id
      ORDER BY item.name ASC
    `);

    const units = await client.query(`
      SELECT
        unit.id,
        unit.company_id,
        company.name AS company_name,
        unit.code,
        unit.name,
        unit.symbol,
        unit.unit_type,
        unit.conversion_factor,
        unit.active
      FROM public.units AS unit
      LEFT JOIN public.companies AS company ON company.id = unit.company_id
      ORDER BY unit.name ASC
    `);

    const yields = await client.query(`
      SELECT
        catalog_yield.id,
        catalog_yield.company_id,
        company.name AS company_name,
        catalog_yield.catalog_item_id,
        COALESCE(item.name, 'Sin concepto') AS catalog_item_name,
        catalog_yield.output_unit_id,
        COALESCE(output_unit.symbol, '—') AS output_unit_symbol,
        catalog_yield.name,
        catalog_yield.output_quantity,
        catalog_yield.labor_hours,
        catalog_yield.crew_size,
        catalog_yield.waste_percentage,
        COALESCE(catalog_yield.notes, '') AS notes,
        catalog_yield.active
      FROM public.catalog_yields AS catalog_yield
      LEFT JOIN public.companies AS company ON company.id = catalog_yield.company_id
      LEFT JOIN public.catalog_items AS item ON item.id = catalog_yield.catalog_item_id
      LEFT JOIN public.units AS output_unit ON output_unit.id = catalog_yield.output_unit_id
      ORDER BY catalog_yield.name ASC
    `);

    const formulas = await client.query(`
      SELECT
        formula.id,
        formula.company_id,
        company.name AS company_name,
        formula.code,
        formula.name,
        COALESCE(formula.description, '') AS description,
        formula.active
      FROM public.calculation_formulas AS formula
      LEFT JOIN public.companies AS company ON company.id = formula.company_id
      ORDER BY formula.name ASC
    `);

    const parameters = await client.query(`
      SELECT
        id, formula_id, parameter_key, label, numeric_value,
        COALESCE(unit_label, '') AS unit_label,
        COALESCE(description, '') AS description,
        active, sort_order
      FROM public.calculation_formula_parameters
      ORDER BY formula_id, sort_order ASC
    `);

    const globalItems = await client.query(`
      SELECT
        id,
        COALESCE(sku, '') AS sku,
        name,
        COALESCE(description, '') AS description,
        item_type,
        COALESCE(category_name, 'Sin categoría') AS category_name,
        COALESCE(unit_name, 'Unidad') AS unit_name,
        COALESCE(unit_symbol, 'und.') AS unit_symbol,
        default_unit_cost,
        default_sale_price,
        default_waste_percentage,
        active
      FROM public.platform_catalog_items
      ORDER BY item_type ASC, name ASC
    `);

    const counts = await client.query<{
      project_count: string;
      client_count: string;
      history_count: string;
    }>(`
      SELECT
        (SELECT count(*) FROM public.projects) AS project_count,
        (SELECT count(*) FROM public.clients) AS client_count,
        (SELECT count(*) FROM public.platform_catalog_price_history) AS history_count
    `);

    const parametersByFormula = new Map<string, Array<Record<string, unknown>>>();
    for (const parameter of parameters.rows) {
      const formulaId = String(parameter.formula_id);
      const values = parametersByFormula.get(formulaId) ?? [];
      values.push({
        id: parameter.id,
        parameterKey: parameter.parameter_key,
        label: parameter.label,
        numericValue: Number(parameter.numeric_value ?? 0),
        unitLabel: parameter.unit_label,
        description: parameter.description,
        active: Boolean(parameter.active),
        sortOrder: Number(parameter.sort_order ?? 0)
      });
      parametersByFormula.set(formulaId, values);
    }

    const countRow = counts.rows[0];

    return {
      users: users.rows.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        phone: row.phone,
        role: row.role,
        active: Boolean(row.active),
        approvedAt: row.approved_at ?? null,
        approvedBy: row.approved_by ?? null,
        createdAt: row.created_at,
        companyName: row.company_name
      })),
      companies: companies.rows.map((row) => ({
        id: row.id,
        name: row.name,
        active: Boolean(row.active)
      })),
      categories: categories.rows.map((row) => ({
        id: row.id,
        companyId: row.company_id,
        companyName: row.company_name ?? "Sin empresa",
        name: row.name,
        description: row.description,
        active: Boolean(row.active)
      })),
      items: items.rows.map((row) => ({
        id: row.id,
        companyId: row.company_id,
        companyName: row.company_name ?? "Sin empresa",
        sku: row.sku,
        name: row.name,
        description: row.description,
        itemType: row.item_type,
        categoryId: row.category_id ?? null,
        categoryName: row.category_name,
        unitId: row.unit_id,
        unitSymbol: row.unit_symbol,
        unitCost: Number(row.unit_cost ?? 0),
        salePrice: Number(row.sale_price ?? 0),
        wastePercentage: Number(row.waste_percentage ?? 0),
        active: Boolean(row.active)
      })),
      globalItems: globalItems.rows.map((row) => ({
        id: row.id,
        sku: row.sku,
        name: row.name,
        description: row.description,
        itemType: row.item_type,
        categoryName: row.category_name,
        unitName: row.unit_name,
        unitSymbol: row.unit_symbol,
        unitCost: Number(row.default_unit_cost ?? 0),
        salePrice: Number(row.default_sale_price ?? 0),
        wastePercentage: Number(row.default_waste_percentage ?? 0),
        active: Boolean(row.active)
      })),
      units: units.rows.map((row) => ({
        id: row.id,
        companyId: row.company_id,
        companyName: row.company_name ?? "Sin empresa",
        code: row.code,
        name: row.name,
        symbol: row.symbol,
        unitType: row.unit_type,
        conversionFactor: Number(row.conversion_factor ?? 1),
        active: Boolean(row.active)
      })),
      yields: yields.rows.map((row) => ({
        id: row.id,
        companyId: row.company_id,
        companyName: row.company_name ?? "Sin empresa",
        catalogItemId: row.catalog_item_id,
        catalogItemName: row.catalog_item_name,
        outputUnitId: row.output_unit_id,
        outputUnitSymbol: row.output_unit_symbol,
        name: row.name,
        outputQuantity: Number(row.output_quantity ?? 0),
        laborHours: Number(row.labor_hours ?? 0),
        crewSize: Number(row.crew_size ?? 0),
        wastePercentage: Number(row.waste_percentage ?? 0),
        notes: row.notes,
        active: Boolean(row.active)
      })),
      formulas: formulas.rows.map((row) => ({
        id: row.id,
        companyId: row.company_id,
        companyName: row.company_name ?? "Sin empresa",
        code: row.code,
        name: row.name,
        description: row.description,
        active: Boolean(row.active),
        parameters: parametersByFormula.get(String(row.id)) ?? []
      })),
      stats: {
        totalUsers: users.rows.length,
        activeUsers: users.rows.filter((u) => u.active).length,
        totalCompanies: companies.rows.length,
        totalProjects: Number(countRow?.project_count ?? 0),
        totalClients: Number(countRow?.client_count ?? 0),
        totalCategories: categories.rows.length,
        totalItems: items.rows.length,
        totalGlobalItems: globalItems.rows.length,
        totalUnits: units.rows.length,
        totalYields: yields.rows.length,
        totalFormulas: formulas.rows.length,
        priceHistoryCount: Number(countRow?.history_count ?? 0)
      }
    };
  });
}

export async function updateAdminUserRepo(userId: string, targetUserId: string, input: UserInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.profiles
        SET
          full_name = $1,
          phone = $2,
          role = $3::public.user_role,
          active = $4,
          approved_at = $5,
          approved_by = $6,
          updated_at = now()
        WHERE id = $7
        RETURNING id
      `,
      [
        input.fullName,
        input.phone,
        input.role,
        input.active,
        input.approvedAt ? new Date(input.approvedAt) : null,
        input.approvedBy,
        targetUserId
      ]
    );

    return (result.rowCount ?? 0) > 0;
  });
}
