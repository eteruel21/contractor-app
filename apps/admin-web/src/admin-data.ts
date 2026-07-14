import { supabase } from "./supabase";

const db = supabase;

export type UserRole = "super_admin" | "contractor" | "client";
export type ItemType =
  | "material"
  | "labor"
  | "equipment"
  | "service"
  | "subcontract";
export type UnitType =
  | "length"
  | "area"
  | "volume"
  | "weight"
  | "unit"
  | "time"
  | "package"
  | "service";

export type Company = {
  id: string;
  name: string;
  active: boolean;
};

export type PlatformUser = {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  active: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  companyName: string;
};

export type Category = {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  description: string;
  active: boolean;
};

export type CatalogItem = {
  id: string;
  companyId: string;
  companyName: string;
  sku: string;
  name: string;
  description: string;
  itemType: ItemType;
  categoryId: string | null;
  categoryName: string;
  unitId: string;
  unitSymbol: string;
  unitCost: number;
  salePrice: number;
  wastePercentage: number;
  active: boolean;
};

export type GlobalCatalogItem = {
  id: string;
  sku: string;
  name: string;
  itemType: ItemType;
  categoryName: string;
  unitName: string;
  unitSymbol: string;
  unitCost: number;
  salePrice: number;
  wastePercentage: number;
  active: boolean;
};

export type Unit = {
  id: string;
  companyId: string;
  companyName: string;
  code: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
  active: boolean;
};

export type CatalogYield = {
  id: string;
  companyId: string;
  companyName: string;
  catalogItemId: string;
  catalogItemName: string;
  outputUnitId: string;
  outputUnitSymbol: string;
  name: string;
  outputQuantity: number;
  laborHours: number;
  crewSize: number;
  wastePercentage: number;
  notes: string;
  active: boolean;
};

export type FormulaParameter = {
  id?: string;
  parameterKey: string;
  label: string;
  numericValue: number;
  unitLabel: string;
  description: string;
  active: boolean;
  sortOrder: number;
};

export type Formula = {
  id: string;
  companyId: string;
  companyName: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  parameters: FormulaParameter[];
};

export type AdminData = {
  users: PlatformUser[];
  companies: Company[];
  categories: Category[];
  items: CatalogItem[];
  globalItems: GlobalCatalogItem[];
  units: Unit[];
  yields: CatalogYield[];
  formulas: Formula[];
  projectCount: number;
  clientCount: number;
  priceHistoryCount: number;
  warnings: string[];
};

export type UserDraft = Omit<PlatformUser, "createdAt" | "companyName">;
export type CategoryDraft = Omit<Category, "companyName">;
export type ItemDraft = Omit<
  CatalogItem,
  "companyName" | "categoryName" | "unitSymbol"
>;
export type GlobalCatalogItemDraft = Pick<
  GlobalCatalogItem,
  "id" | "unitCost" | "salePrice" | "wastePercentage"
>;
export type UnitDraft = Omit<Unit, "companyName">;
export type YieldDraft = Omit<
  CatalogYield,
  "companyName" | "catalogItemName" | "outputUnitSymbol"
>;
export type FormulaDraft = Omit<Formula, "companyName">;

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function throwIfError(error: unknown) {
  if (!error) return;
  if (typeof error === "object" && error && "message" in error) {
    throw new Error(String(error.message));
  }
  throw new Error("Ocurrió un error inesperado.");
}

function required(value: string, label: string) {
  const clean = value.trim();
  if (!clean) throw new Error(`${label} es obligatorio.`);
  return clean;
}

function nonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} debe ser mayor o igual a cero.`);
  }
  return value;
}

function percentage(value: number, label: string) {
  const validValue = nonNegative(value, label);
  if (validValue > 100) {
    throw new Error(`${label} debe estar entre 0 y 100.`);
  }
  return validValue;
}

function positive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} debe ser mayor que cero.`);
  }
  return value;
}

function normalizeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function loadAdminData(): Promise<AdminData> {
  const results = await Promise.all([
    db
      .from("profiles")
      .select("id, full_name, phone, role, active, approved_at, approved_by, created_at")
      .order("active", { ascending: true })
      .order("created_at", { ascending: false }),
    db
      .from("company_members")
      .select("user_id, active, company:companies(id, name, active)")
      .order("active", { ascending: false }),
    db.from("companies").select("id, name, active").order("name"),
    db.from("projects").select("id", { count: "exact", head: true }),
    db.from("clients").select("id", { count: "exact", head: true }),
    db
      .from("catalog_categories")
      .select("id, company_id, name, description, active, company:companies(name)")
      .order("name"),
    db
      .from("catalog_items")
      .select(`
        id, company_id, sku, name, description, item_type, category_id,
        unit_id, unit_cost, sale_price, waste_percentage, active,
        company:companies(name), category:catalog_categories(name), unit:units(symbol)
      `)
      .order("name"),
    db
      .from("units")
      .select("id, company_id, code, name, symbol, unit_type, conversion_factor, active, company:companies(name)")
      .order("name"),
    db
      .from("catalog_yields")
      .select(`
        id, company_id, catalog_item_id, output_unit_id, name,
        output_quantity, labor_hours, crew_size, waste_percentage, notes, active,
        company:companies(name), item:catalog_items(name), output_unit:units(symbol)
      `)
      .order("name"),
    db
      .from("calculation_formulas")
      .select(`
        id, company_id, code, name, description, active, company:companies(name),
        parameters:calculation_formula_parameters(
          id, parameter_key, label, numeric_value, unit_label,
          description, active, sort_order
        )
      `)
      .order("name"),
    db
      .from("platform_catalog_items")
      .select(`
        id, sku, name, item_type, category_name, unit_name, unit_symbol,
        default_unit_cost, default_sale_price,
        default_waste_percentage, active
      `)
      .order("item_type")
      .order("name"),
    db
      .from("platform_catalog_price_history")
      .select("id", { count: "exact", head: true }),
  ]);

  const [
    usersResult,
    membershipsResult,
    companiesResult,
    projectsResult,
    clientsResult,
    categoriesResult,
    itemsResult,
    unitsResult,
    yieldsResult,
    formulasResult,
    globalItemsResult,
    historyResult,
  ] = results;

  [
    usersResult,
    membershipsResult,
    companiesResult,
    projectsResult,
    clientsResult,
    categoriesResult,
    itemsResult,
    unitsResult,
    yieldsResult,
    formulasResult,
  ].forEach((result) => throwIfError(result.error));

  const platformErrors = [
    globalItemsResult.error,
    historyResult.error,
  ].filter(Boolean);
  const warnings = platformErrors.length > 0
    ? [
        "El catálogo global todavía no está disponible en Supabase. " +
          "Los usuarios, empresas y datos anteriores siguen visibles; " +
          "aplica la migración pendiente para habilitar los precios globales.",
      ]
    : [];

  const companyByUser = new Map<string, string>();
  for (const membership of membershipsResult.data ?? []) {
    if (companyByUser.has(membership.user_id)) continue;
    const company = first<{ name: string }>(membership.company);
    if (company) companyByUser.set(membership.user_id, company.name);
  }

  return {
    users: (usersResult.data ?? []).map((row) => ({
      id: row.id,
      fullName: row.full_name ?? "",
      phone: row.phone ?? "",
      role: row.role as UserRole,
      active: Boolean(row.active),
      approvedAt: row.approved_at ?? null,
      approvedBy: row.approved_by ?? null,
      createdAt: row.created_at,
      companyName: companyByUser.get(row.id) ?? "Sin empresa",
    })),
    companies: (companiesResult.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      active: Boolean(row.active),
    })),
    categories: (categoriesResult.data ?? []).map((row) => ({
      id: row.id,
      companyId: row.company_id,
      companyName: first<{ name: string }>(row.company)?.name ?? "Sin empresa",
      name: row.name,
      description: row.description ?? "",
      active: Boolean(row.active),
    })),
    items: (itemsResult.data ?? []).map((row) => ({
      id: row.id,
      companyId: row.company_id,
      companyName: first<{ name: string }>(row.company)?.name ?? "Sin empresa",
      sku: row.sku ?? "",
      name: row.name,
      description: row.description ?? "",
      itemType: row.item_type as ItemType,
      categoryId: row.category_id ?? null,
      categoryName: first<{ name: string }>(row.category)?.name ?? "Sin categoría",
      unitId: row.unit_id,
      unitSymbol: first<{ symbol: string }>(row.unit)?.symbol ?? "—",
      unitCost: Number(row.unit_cost ?? 0),
      salePrice: Number(row.sale_price ?? 0),
      wastePercentage: Number(row.waste_percentage ?? 0),
      active: Boolean(row.active),
    })),
    globalItems: (globalItemsResult.data ?? []).map((row) => ({
      id: row.id,
      sku: row.sku ?? "",
      name: row.name,
      itemType: row.item_type as ItemType,
      categoryName: row.category_name ?? "Sin categoría",
      unitName: row.unit_name ?? "Unidad",
      unitSymbol: row.unit_symbol ?? "und.",
      unitCost: Number(row.default_unit_cost ?? 0),
      salePrice: Number(row.default_sale_price ?? 0),
      wastePercentage: Number(row.default_waste_percentage ?? 0),
      active: Boolean(row.active),
    })),
    units: (unitsResult.data ?? []).map((row) => ({
      id: row.id,
      companyId: row.company_id,
      companyName: first<{ name: string }>(row.company)?.name ?? "Sin empresa",
      code: row.code,
      name: row.name,
      symbol: row.symbol,
      unitType: row.unit_type as UnitType,
      conversionFactor: Number(row.conversion_factor ?? 1),
      active: Boolean(row.active),
    })),
    yields: (yieldsResult.data ?? []).map((row) => ({
      id: row.id,
      companyId: row.company_id,
      companyName: first<{ name: string }>(row.company)?.name ?? "Sin empresa",
      catalogItemId: row.catalog_item_id,
      catalogItemName: first<{ name: string }>(row.item)?.name ?? "Sin concepto",
      outputUnitId: row.output_unit_id,
      outputUnitSymbol: first<{ symbol: string }>(row.output_unit)?.symbol ?? "—",
      name: row.name,
      outputQuantity: Number(row.output_quantity ?? 0),
      laborHours: Number(row.labor_hours ?? 0),
      crewSize: Number(row.crew_size ?? 0),
      wastePercentage: Number(row.waste_percentage ?? 0),
      notes: row.notes ?? "",
      active: Boolean(row.active),
    })),
    formulas: (formulasResult.data ?? []).map((row) => ({
      id: row.id,
      companyId: row.company_id,
      companyName: first<{ name: string }>(row.company)?.name ?? "Sin empresa",
      code: row.code,
      name: row.name,
      description: row.description ?? "",
      active: Boolean(row.active),
      parameters: (row.parameters ?? [])
        .map((parameter) => ({
          id: parameter.id,
          parameterKey: parameter.parameter_key,
          label: parameter.label,
          numericValue: Number(parameter.numeric_value ?? 0),
          unitLabel: parameter.unit_label ?? "",
          description: parameter.description ?? "",
          active: Boolean(parameter.active),
          sortOrder: Number(parameter.sort_order ?? 0),
        }))
        .sort((a: FormulaParameter, b: FormulaParameter) => a.sortOrder - b.sortOrder),
    })),
    projectCount: projectsResult.count ?? 0,
    clientCount: clientsResult.count ?? 0,
    priceHistoryCount: historyResult.count ?? 0,
    warnings,
  };
}

export async function saveUser(draft: UserDraft, actorId: string) {
  const approving = draft.active && !draft.approvedAt;
  const { error } = await db
    .from("profiles")
    .update({
      full_name: draft.fullName.trim() || null,
      phone: draft.phone.trim() || null,
      role: draft.role,
      active: draft.active,
      approved_at: approving ? new Date().toISOString() : draft.approvedAt,
      approved_by: approving ? actorId : draft.approvedBy,
    })
    .eq("id", draft.id);
  throwIfError(error);
}

export async function saveCategory(draft: CategoryDraft) {
  const payload = {
    company_id: required(draft.companyId, "La empresa"),
    name: required(draft.name, "El nombre"),
    description: draft.description.trim() || null,
    active: draft.active,
  };
  const result = draft.id
    ? await db.from("catalog_categories").update(payload).eq("id", draft.id)
    : await db.from("catalog_categories").insert(payload);
  throwIfError(result.error);
}

export async function saveItem(draft: ItemDraft) {
  const { error } = await db.rpc("admin_save_catalog_item", {
    requested_item_id: draft.id || null,
    requested_company_id: draft.companyId,
    requested_sku: draft.sku.trim(),
    requested_name: required(draft.name, "El nombre"),
    requested_description: draft.description.trim(),
    requested_item_type: draft.itemType,
    requested_category_id: draft.categoryId,
    requested_unit_id: required(draft.unitId, "La unidad"),
    requested_unit_cost: nonNegative(draft.unitCost, "El costo"),
    requested_sale_price: nonNegative(draft.salePrice, "El precio"),
    requested_waste_percentage: percentage(draft.wastePercentage, "El desperdicio"),
    requested_active: draft.active,
  });
  throwIfError(error);
}

export async function saveUnit(draft: UnitDraft) {
  const payload = {
    company_id: required(draft.companyId, "La empresa"),
    code: required(normalizeCode(draft.code), "El código"),
    name: required(draft.name, "El nombre"),
    symbol: required(draft.symbol, "El símbolo"),
    unit_type: draft.unitType,
    conversion_factor: positive(draft.conversionFactor, "El factor"),
    active: draft.active,
  };
  const result = draft.id
    ? await db.from("units").update(payload).eq("id", draft.id)
    : await db.from("units").insert(payload);
  throwIfError(result.error);
}

export async function saveYield(draft: YieldDraft) {
  const payload = {
    company_id: required(draft.companyId, "La empresa"),
    catalog_item_id: required(draft.catalogItemId, "El concepto"),
    output_unit_id: required(draft.outputUnitId, "La unidad de salida"),
    name: required(draft.name, "El nombre"),
    output_quantity: positive(draft.outputQuantity, "La producción"),
    labor_hours: nonNegative(draft.laborHours, "Las horas"),
    crew_size: positive(draft.crewSize, "La cuadrilla"),
    waste_percentage: percentage(draft.wastePercentage, "El desperdicio"),
    notes: draft.notes.trim() || null,
    active: draft.active,
  };
  const result = draft.id
    ? await db.from("catalog_yields").update(payload).eq("id", draft.id)
    : await db.from("catalog_yields").insert(payload);
  throwIfError(result.error);
}

export async function saveFormula(draft: FormulaDraft) {
  const parameters = draft.parameters.map((parameter) => ({
      parameter_key: required(normalizeCode(parameter.parameterKey), "La clave"),
      label: required(parameter.label, "La etiqueta"),
      numeric_value: nonNegative(parameter.numericValue, "El valor"),
      unit_label: parameter.unitLabel.trim() || null,
      description: parameter.description.trim() || null,
      active: parameter.active,
      sort_order: parameter.sortOrder,
  }));
  const { error } = await db.rpc("admin_save_formula", {
    requested_formula_id: draft.id || null,
    requested_company_id: required(draft.companyId, "La empresa"),
    requested_code: required(normalizeCode(draft.code), "El código"),
    requested_name: required(draft.name, "El nombre"),
    requested_description: draft.description.trim(),
    requested_active: draft.active,
    requested_parameters: parameters,
  });
  throwIfError(error);
}

export async function saveGlobalCatalogPricing(
  draft: GlobalCatalogItemDraft,
) {
  const { error } = await db.rpc(
    "admin_update_platform_catalog_pricing",
    {
      requested_item_id: draft.id,
      requested_unit_cost: nonNegative(draft.unitCost, "El costo"),
      requested_sale_price: nonNegative(draft.salePrice, "El precio"),
      requested_waste_percentage: percentage(
        draft.wastePercentage,
        "El desperdicio",
      ),
      change_source: "panel_super_admin",
      change_notes: "Edición individual del precio maestro",
    },
  );
  throwIfError(error);
}

export async function adjustPrices(input: {
  itemIds: string[];
  target: "unit_cost" | "sale_price";
  percentage: number;
  notes: string;
}) {
  if (input.itemIds.length === 0) {
    throw new Error("Selecciona al menos un concepto activo.");
  }
  if (!Number.isFinite(input.percentage) || input.percentage <= -100) {
    throw new Error("El porcentaje debe ser un número mayor que -100.");
  }

  const { error } = await db.rpc("admin_adjust_platform_catalog_prices", {
    requested_item_ids: input.itemIds,
    requested_target: input.target,
    requested_percentage: input.percentage,
    change_notes: input.notes.trim() || null,
  });
  throwIfError(error);
}
