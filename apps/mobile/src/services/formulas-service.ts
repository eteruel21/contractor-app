import { supabase } from "@/services/supabase";
import type {
  CatalogItemType,
  CatalogYield,
  Unit,
} from "@/types/catalog";

export type FormulaCatalogItem = {
  id: string;
  name: string;
  item_type: CatalogItemType;
  active: boolean;
};

export type FormulaInput = {
  companyId: string;
  catalogItemId: string;
  outputUnitId: string;
  name: string;
  outputQuantity: number;
  laborHours: number;
  crewSize: number;
  wastePercentage: number;
  notes?: string;
};

function validateFormula(input: FormulaInput): string | null {
  if (!input.catalogItemId) {
    return "Selecciona un elemento del catálogo.";
  }

  if (!input.outputUnitId) {
    return "Selecciona una unidad de salida.";
  }

  if (input.name.trim().length < 2) {
    return "Introduce un nombre válido para la fórmula.";
  }

  if (!Number.isFinite(input.outputQuantity) || input.outputQuantity <= 0) {
    return "La producción debe ser mayor que cero.";
  }

  if (!Number.isFinite(input.laborHours) || input.laborHours < 0) {
    return "Las horas de trabajo no pueden ser negativas.";
  }

  if (!Number.isFinite(input.crewSize) || input.crewSize <= 0) {
    return "La cuadrilla debe tener al menos una persona.";
  }

  if (
    !Number.isFinite(input.wastePercentage) ||
    input.wastePercentage < 0 ||
    input.wastePercentage > 100
  ) {
    return "El desperdicio debe estar entre 0 y 100 %.";
  }

  return null;
}

export async function listAdminFormulas(
  companyId: string,
): Promise<{
  formulas: CatalogYield[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("catalog_yields")
    .select("*")
    .eq("company_id", companyId)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  return {
    formulas: error ? [] : (data ?? []),
    error: error?.message ?? null,
  };
}

export async function listFormulaCatalogItems(
  companyId: string,
): Promise<{
  items: FormulaCatalogItem[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select("id, name, item_type, active")
    .eq("company_id", companyId)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  return {
    items: error ? [] : (data ?? []),
    error: error?.message ?? null,
  };
}

export async function listFormulaUnits(
  companyId: string,
): Promise<{
  units: Unit[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("company_id", companyId)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  return {
    units: error ? [] : (data ?? []),
    error: error?.message ?? null,
  };
}

export async function createAdminFormula(
  input: FormulaInput,
): Promise<{
  formula: CatalogYield | null;
  error: string | null;
}> {
  const validationError = validateFormula(input);

  if (validationError) {
    return { formula: null, error: validationError };
  }

  const { data, error } = await supabase
    .from("catalog_yields")
    .insert({
      company_id: input.companyId,
      catalog_item_id: input.catalogItemId,
      output_unit_id: input.outputUnitId,
      name: input.name.trim(),
      output_quantity: input.outputQuantity,
      labor_hours: input.laborHours,
      crew_size: input.crewSize,
      waste_percentage: input.wastePercentage,
      notes: input.notes?.trim() || null,
      active: true,
    })
    .select("*")
    .single();

  return {
    formula: error ? null : data,
    error: error?.message ?? null,
  };
}

export async function updateAdminFormula(
  input: FormulaInput & { formulaId: string },
): Promise<{
  formula: CatalogYield | null;
  error: string | null;
}> {
  const validationError = validateFormula(input);

  if (validationError) {
    return { formula: null, error: validationError };
  }

  const { data, error } = await supabase
    .from("catalog_yields")
    .update({
      catalog_item_id: input.catalogItemId,
      output_unit_id: input.outputUnitId,
      name: input.name.trim(),
      output_quantity: input.outputQuantity,
      labor_hours: input.laborHours,
      crew_size: input.crewSize,
      waste_percentage: input.wastePercentage,
      notes: input.notes?.trim() || null,
    })
    .eq("company_id", input.companyId)
    .eq("id", input.formulaId)
    .select("*")
    .single();

  return {
    formula: error ? null : data,
    error: error?.message ?? null,
  };
}

export async function setAdminFormulaActive(input: {
  companyId: string;
  formulaId: string;
  active: boolean;
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("catalog_yields")
    .update({ active: input.active })
    .eq("company_id", input.companyId)
    .eq("id", input.formulaId);

  return { error: error?.message ?? null };
}
