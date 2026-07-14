import { supabase } from "@/services/supabase";

function normalizeFormulaCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function getFormulaParameterMap(
  input: {
    companyId: string;
    formulaCode: string;
  },
): Promise<{
  parameters: Record<string, number>;
  error: string | null;
}> {
  const { data: formula, error } = await supabase
    .from("calculation_formulas")
    .select("id")
    .eq("company_id", input.companyId)
    .eq(
      "code",
      normalizeFormulaCode(input.formulaCode),
    )
    .eq("active", true)
    .maybeSingle();

  if (error) {
    return {
      parameters: {},
      error: error.message,
    };
  }

  if (!formula) {
    return {
      parameters: {},
      error:
        "La configuración de cálculo no existe o está inactiva.",
    };
  }

  const {
    data: rows,
    error: parametersError,
  } = await supabase
    .from("calculation_formula_parameters")
    .select("parameter_key, numeric_value")
    .eq("company_id", input.companyId)
    .eq("formula_id", formula.id)
    .eq("active", true);

  if (parametersError) {
    return {
      parameters: {},
      error: parametersError.message,
    };
  }

  const parameters: Record<string, number> = {};

  for (const row of rows ?? []) {
    const numericValue = Number(row.numeric_value);

    if (Number.isFinite(numericValue)) {
      parameters[row.parameter_key] =
        numericValue;
    }
  }

  return {
    parameters,
    error: null,
  };
}

export function subscribeToAdminFormulas(
  companyId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`formula-runtime:${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "calculation_formulas",
        filter: `company_id=eq.${companyId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table:
          "calculation_formula_parameters",
        filter: `company_id=eq.${companyId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
