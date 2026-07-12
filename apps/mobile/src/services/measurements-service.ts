import { supabase } from "@/services/supabase";
import type { Unit, UnitType } from "@/types/catalog";

type MeasurementUnitInput = {
  companyId: string;
  code: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
};

function validateInput(input: MeasurementUnitInput): string | null {
  if (!input.code.trim()) return "Introduce un código.";
  if (input.name.trim().length < 2) return "Introduce un nombre válido.";
  if (!input.symbol.trim()) return "Introduce un símbolo.";
  if (!Number.isFinite(input.conversionFactor) || input.conversionFactor <= 0) {
    return "El factor de conversión debe ser mayor que cero.";
  }
  return null;
}

export async function listMeasurementUnits(companyId: string): Promise<{
  units: Unit[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("company_id", companyId)
    .order("unit_type", { ascending: true })
    .order("name", { ascending: true });

  return {
    units: error ? [] : (data ?? []),
    error: error?.message ?? null,
  };
}

export async function createMeasurementUnit(
  input: MeasurementUnitInput,
): Promise<{ unit: Unit | null; error: string | null }> {
  const validationError = validateInput(input);
  if (validationError) return { unit: null, error: validationError };

  const { data, error } = await supabase
    .from("units")
    .insert({
      company_id: input.companyId,
      code: input.code.trim().toLowerCase(),
      name: input.name.trim(),
      symbol: input.symbol.trim(),
      unit_type: input.unitType,
      conversion_factor: input.conversionFactor,
      active: true,
    })
    .select("*")
    .single();

  return {
    unit: error ? null : data,
    error: error?.message ?? null,
  };
}

export async function updateMeasurementUnit(
  input: MeasurementUnitInput & { unitId: string },
): Promise<{ unit: Unit | null; error: string | null }> {
  const validationError = validateInput(input);
  if (validationError) return { unit: null, error: validationError };

  const { data, error } = await supabase
    .from("units")
    .update({
      code: input.code.trim().toLowerCase(),
      name: input.name.trim(),
      symbol: input.symbol.trim(),
      unit_type: input.unitType,
      conversion_factor: input.conversionFactor,
    })
    .eq("company_id", input.companyId)
    .eq("id", input.unitId)
    .select("*")
    .single();

  return {
    unit: error ? null : data,
    error: error?.message ?? null,
  };
}

export async function setMeasurementUnitActive(input: {
  companyId: string;
  unitId: string;
  active: boolean;
}): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("units")
    .update({ active: input.active })
    .eq("company_id", input.companyId)
    .eq("id", input.unitId);

  return { error: error?.message ?? null };
}

export function convertMeasurement(
  quantity: number,
  source: Unit,
  target: Unit,
): number | null {
  if (
    source.unit_type !== target.unit_type ||
    !Number.isFinite(quantity) ||
    source.conversion_factor <= 0 ||
    target.conversion_factor <= 0
  ) {
    return null;
  }

  return quantity * source.conversion_factor / target.conversion_factor;
}
