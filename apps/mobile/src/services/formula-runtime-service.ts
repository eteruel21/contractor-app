import {
  authenticatedRequest
} from "@/services/api";
import {
  createPollingSubscription
} from "@/services/polling-service";

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function getFormulaParameterMap(
  input: {
    companyId: string;
    formulaCode: string;
  }
): Promise<{
  parameters: Record<string, number>;
  error: string | null;
}> {
  try {
    const query =
      new URLSearchParams({
        companyId: input.companyId,
        formulaCode:
          input.formulaCode
      }).toString();

    const response =
      await authenticatedRequest<{
        parameters:
          Record<string, number>;
      }>(
        `/formulas/runtime?${query}`
      );

    return {
      parameters:
        response.parameters,
      error: null
    };
  } catch (error) {
    return {
      parameters: {},
      error: errorMessage(error)
    };
  }
}

export function subscribeToAdminFormulas(
  _companyId: string,
  onChange: () => void
): () => void {
  return createPollingSubscription(
    onChange,
    15000
  );
}