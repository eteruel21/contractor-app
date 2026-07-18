import {
  authenticatedRequest
} from "@/services/api";
import type {
  Unit,
  UnitType
} from "@/types/catalog";

type MeasurementUnitInput = {
  companyId: string;
  code: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
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

export async function listMeasurementUnits(
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
        `/measurements/units?companyId=${encodeURIComponent(companyId)}`
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

export async function createMeasurementUnit(
  input: MeasurementUnitInput
): Promise<{
  unit: Unit | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        unit: UnitRow;
      }>(
        "/measurements/units",
        {
          method: "POST",
          body: JSON.stringify({
            ...input,
            code:
              input.code
                .trim()
                .toLowerCase(),
            name:
              input.name.trim(),
            symbol:
              input.symbol.trim()
          })
        }
      );

    return {
      unit:
        normalizeUnit(
          response.unit
        ),
      error: null
    };
  } catch (error) {
    return {
      unit: null,
      error: errorMessage(error)
    };
  }
}

export async function updateMeasurementUnit(
  input:
    MeasurementUnitInput & {
      unitId: string;
    }
): Promise<{
  unit: Unit | null;
  error: string | null;
}> {
  try {
    const {
      unitId,
      ...body
    } = input;

    const response =
      await authenticatedRequest<{
        unit: UnitRow;
      }>(
        `/measurements/units/${unitId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...body,
            code:
              body.code
                .trim()
                .toLowerCase(),
            name:
              body.name.trim(),
            symbol:
              body.symbol.trim()
          })
        }
      );

    return {
      unit:
        normalizeUnit(
          response.unit
        ),
      error: null
    };
  } catch (error) {
    return {
      unit: null,
      error: errorMessage(error)
    };
  }
}

export async function setMeasurementUnitActive(
  input: {
    companyId: string;
    unitId: string;
    active: boolean;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/measurements/units/${input.unitId}/active`,
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

export function convertMeasurement(
  quantity: number,
  source: Unit,
  target: Unit
): number | null {
  if (
    source.unit_type !==
      target.unit_type ||
    !Number.isFinite(quantity) ||
    source.conversion_factor <= 0 ||
    target.conversion_factor <= 0
  ) {
    return null;
  }

  return (
    quantity *
    source.conversion_factor /
    target.conversion_factor
  );
}