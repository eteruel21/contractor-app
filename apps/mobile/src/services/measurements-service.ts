import { supabase } from "@/services/supabase";
import type {
  Unit,
  UnitType,
} from "@/types/catalog";

export type UnitUsage = {
  catalogItems: number;
  catalogYields: number;
  total: number;
};

export type UnitWithUsage = Unit & {
  usage: UnitUsage;
};

export async function listAdminUnits(
  companyId: string,
): Promise<{
  units: UnitWithUsage[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("company_id", companyId)
    .order("active", { ascending: false })
    .order("unit_type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return {
      units: [],
      error: error.message,
    };
  }

  const units = await Promise.all(
    (data ?? []).map(async (unit) => {
      const usageResult = await getUnitUsage({
        companyId,
        unitId: unit.id,
      });

      return {
        ...unit,
        usage: usageResult.usage,
      } satisfies UnitWithUsage;
    }),
  );

  return {
    units,
    error: null,
  };
}

export async function getAdminUnit(input: {
  companyId: string;
  unitId: string;
}): Promise<{
  unit: UnitWithUsage | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("company_id", input.companyId)
    .eq("id", input.unitId)
    .maybeSingle();

  if (error) {
    return {
      unit: null,
      error: error.message,
    };
  }

  if (!data) {
    return {
      unit: null,
      error: null,
    };
  }

  const usageResult = await getUnitUsage(input);

  return {
    unit: {
      ...data,
      usage: usageResult.usage,
    },
    error: usageResult.error,
  };
}

export async function createAdminUnit(input: {
  companyId: string;
  code: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
}): Promise<{
  unit: Unit | null;
  error: string | null;
}> {
  const code = normalizeCode(input.code);
  const name = input.name.trim();
  const symbol = input.symbol.trim();
  const conversionFactor = normalizeFactor(
    input.conversionFactor,
  );

  const validationError = validateUnit({
    code,
    name,
    symbol,
    conversionFactor,
  });

  if (validationError) {
    return {
      unit: null,
      error: validationError,
    };
  }

  const duplicateResult = await findDuplicateUnit({
    companyId: input.companyId,
    code,
    excludeId: null,
  });

  if (duplicateResult.error) {
    return {
      unit: null,
      error: duplicateResult.error,
    };
  }

  if (duplicateResult.exists) {
    return {
      unit: null,
      error:
        "Ya existe una unidad con ese código en la empresa.",
    };
  }

  const { data, error } = await supabase
    .from("units")
    .insert({
      company_id: input.companyId,
      code,
      name,
      symbol,
      unit_type: input.unitType,
      conversion_factor: conversionFactor,
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    return {
      unit: null,
      error: error.message,
    };
  }

  return {
    unit: data,
    error: null,
  };
}

export async function updateAdminUnit(input: {
  companyId: string;
  unitId: string;
  code: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
}): Promise<{
  unit: Unit | null;
  error: string | null;
}> {
  const code = normalizeCode(input.code);
  const name = input.name.trim();
  const symbol = input.symbol.trim();
  const conversionFactor = normalizeFactor(
    input.conversionFactor,
  );

  const validationError = validateUnit({
    code,
    name,
    symbol,
    conversionFactor,
  });

  if (validationError) {
    return {
      unit: null,
      error: validationError,
    };
  }

  const duplicateResult = await findDuplicateUnit({
    companyId: input.companyId,
    code,
    excludeId: input.unitId,
  });

  if (duplicateResult.error) {
    return {
      unit: null,
      error: duplicateResult.error,
    };
  }

  if (duplicateResult.exists) {
    return {
      unit: null,
      error:
        "Ya existe otra unidad con ese código en la empresa.",
    };
  }

  const usageResult = await getUnitUsage({
    companyId: input.companyId,
    unitId: input.unitId,
  });

  if (usageResult.error) {
    return {
      unit: null,
      error: usageResult.error,
    };
  }

  if (usageResult.usage.total > 0) {
    const { data: currentUnit } = await supabase
      .from("units")
      .select("unit_type")
      .eq("company_id", input.companyId)
      .eq("id", input.unitId)
      .maybeSingle();

    if (
      currentUnit &&
      currentUnit.unit_type !== input.unitType
    ) {
      return {
        unit: null,
        error:
          "No puedes cambiar el tipo de una unidad que ya está en uso.",
      };
    }
  }

  const { data, error } = await supabase
    .from("units")
    .update({
      code,
      name,
      symbol,
      unit_type: input.unitType,
      conversion_factor: conversionFactor,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", input.companyId)
    .eq("id", input.unitId)
    .select("*")
    .single();

  if (error) {
    return {
      unit: null,
      error: error.message,
    };
  }

  return {
    unit: data,
    error: null,
  };
}

export async function setAdminUnitActive(input: {
  companyId: string;
  unitId: string;
  active: boolean;
}): Promise<{
  error: string | null;
}> {
  if (!input.active) {
    const usageResult = await getUnitUsage(input);

    if (usageResult.error) {
      return {
        error: usageResult.error,
      };
    }

    if (usageResult.usage.total > 0) {
      return {
        error:
          "Esta unidad está siendo utilizada por el catálogo o por rendimientos. Reemplázala antes de desactivarla.",
      };
    }
  }

  const { error } = await supabase
    .from("units")
    .update({
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", input.companyId)
    .eq("id", input.unitId);

  return {
    error: error?.message ?? null,
  };
}

export async function getUnitUsage(input: {
  companyId: string;
  unitId: string;
}): Promise<{
  usage: UnitUsage;
  error: string | null;
}> {
  const [itemsResult, yieldsResult] =
    await Promise.all([
      supabase
        .from("catalog_items")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("company_id", input.companyId)
        .eq("unit_id", input.unitId),
      supabase
        .from("catalog_yields")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("company_id", input.companyId)
        .eq("output_unit_id", input.unitId),
    ]);

  const error =
    itemsResult.error?.message ??
    yieldsResult.error?.message ??
    null;

  const catalogItems =
    itemsResult.count ?? 0;
  const catalogYields =
    yieldsResult.count ?? 0;

  return {
    usage: {
      catalogItems,
      catalogYields,
      total: catalogItems + catalogYields,
    },
    error,
  };
}

export function convertUnitValue(input: {
  quantity: number;
  fromUnit: Unit;
  toUnit: Unit;
}): {
  value: number | null;
  error: string | null;
} {
  if (
    input.fromUnit.unit_type !==
    input.toUnit.unit_type
  ) {
    return {
      value: null,
      error:
        "Solo se pueden convertir unidades del mismo tipo.",
    };
  }

  if (
    input.fromUnit.conversion_factor <= 0 ||
    input.toUnit.conversion_factor <= 0
  ) {
    return {
      value: null,
      error:
        "Las unidades deben tener factores mayores que cero.",
    };
  }

  if (!Number.isFinite(input.quantity)) {
    return {
      value: null,
      error: "La cantidad no es válida.",
    };
  }

  const baseValue =
    input.quantity *
    input.fromUnit.conversion_factor;

  return {
    value:
      baseValue /
      input.toUnit.conversion_factor,
    error: null,
  };
}

export function subscribeToAdminUnits(
  companyId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`admin-units:${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "units",
        filter: `company_id=eq.${companyId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

async function findDuplicateUnit(input: {
  companyId: string;
  code: string;
  excludeId: string | null;
}): Promise<{
  exists: boolean;
  error: string | null;
}> {
  let query = supabase
    .from("units")
    .select("id")
    .eq("company_id", input.companyId)
    .eq("code", input.code);

  if (input.excludeId) {
    query = query.neq("id", input.excludeId);
  }

  const { data, error } =
    await query.limit(1);

  return {
    exists: (data ?? []).length > 0,
    error: error?.message ?? null,
  };
}

function normalizeCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function normalizeFactor(value: number): number {
  return Number.isFinite(value)
    ? Math.max(value, 0)
    : 0;
}

function validateUnit(input: {
  code: string;
  name: string;
  symbol: string;
  conversionFactor: number;
}): string | null {
  if (input.name.length < 2) {
    return "Introduce un nombre válido.";
  }

  if (input.code.length < 1) {
    return "Introduce un código válido.";
  }

  if (input.symbol.length < 1) {
    return "Introduce un símbolo válido.";
  }

  if (input.conversionFactor <= 0) {
    return "El factor de conversión debe ser mayor que cero.";
  }

  return null;
}
