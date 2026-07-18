import {
  authenticatedRequest
} from "@/services/api";
import type {
  CatalogItemType,
  CatalogYield,
  Unit
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

type FormulaRow =
  Omit<
    CatalogYield,
    | "output_quantity"
    | "labor_hours"
    | "crew_size"
    | "waste_percentage"
  > & {
    output_quantity:
      | number
      | string;
    labor_hours:
      | number
      | string;
    crew_size:
      | number
      | string;
    waste_percentage:
      | number
      | string;
  };

type UnitRow =
  Omit<
    Unit,
    "conversion_factor"
  > & {
    conversion_factor:
      | number
      | string;
  };

function normalizeFormula(
  row: FormulaRow
): CatalogYield {
  return {
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
      )
  };
}

function normalizeUnit(
  row: UnitRow
): Unit {
  return {
    ...row,
    conversion_factor:
      Number(
        row.conversion_factor ?? 1
      )
  };
}

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listAdminFormulas(
  companyId: string
): Promise<{
  formulas: CatalogYield[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        formulas: FormulaRow[];
      }>(
        `/admin/formulas?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      formulas:
        response.formulas.map(
          normalizeFormula
        ),
      error: null
    };
  } catch (error) {
    return {
      formulas: [],
      error: errorMessage(error)
    };
  }
}

export async function listFormulaCatalogItems(
  companyId: string
): Promise<{
  items: FormulaCatalogItem[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        items:
          FormulaCatalogItem[];
      }>(
        `/admin/formulas/items?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      items: response.items,
      error: null
    };
  } catch (error) {
    return {
      items: [],
      error: errorMessage(error)
    };
  }
}

export async function listFormulaUnits(
  companyId: string
): Promise<{
  units: Unit[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        units: UnitRow[];
      }>(
        `/admin/formulas/units?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      units:
        response.units.map(
          normalizeUnit
        ),
      error: null
    };
  } catch (error) {
    return {
      units: [],
      error: errorMessage(error)
    };
  }
}

export async function createAdminFormula(
  input: FormulaInput
): Promise<{
  formula: CatalogYield | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        formula: FormulaRow;
      }>(
        "/admin/formulas",
        {
          method: "POST",
          body: JSON.stringify(input)
        }
      );

    return {
      formula:
        normalizeFormula(
          response.formula
        ),
      error: null
    };
  } catch (error) {
    return {
      formula: null,
      error: errorMessage(error)
    };
  }
}

export async function updateAdminFormula(
  input:
    FormulaInput & {
      formulaId: string;
    }
): Promise<{
  formula: CatalogYield | null;
  error: string | null;
}> {
  try {
    const {
      formulaId,
      ...body
    } = input;

    const response =
      await authenticatedRequest<{
        formula: FormulaRow;
      }>(
        `/admin/formulas/${formulaId}`,
        {
          method: "PATCH",
          body: JSON.stringify(body)
        }
      );

    return {
      formula:
        normalizeFormula(
          response.formula
        ),
      error: null
    };
  } catch (error) {
    return {
      formula: null,
      error: errorMessage(error)
    };
  }
}

export async function setAdminFormulaActive(
  input: {
    companyId: string;
    formulaId: string;
    active: boolean;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/admin/formulas/${input.formulaId}/active`,
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