import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getFormulaParameterMap,
  subscribeToAdminFormulas,
} from "@/services/formula-runtime-service";

type FormulaParameterState = {
  parameters: Record<string, number>;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useFormulaParameters(
  companyId: string | null | undefined,
  formulaCode: string,
): FormulaParameterState {
  const [parameters, setParameters] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!companyId) {
      setParameters({});
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const result = await getFormulaParameterMap({
      companyId,
      formulaCode,
    });

    if (result.error) {
      console.warn(
        `No fue posible cargar ${formulaCode}:`,
        result.error,
      );
      setParameters({});
      setError(result.error);
    } else {
      setParameters(result.parameters);
      setError(null);
    }

    setLoading(false);
  }, [companyId, formulaCode]);

  useEffect(() => {
    let active = true;

    void Promise.resolve().then(() => {
      if (active) void reload();
    });

    return () => {
      active = false;
    };
  }, [reload]);

  useEffect(() => {
    if (!companyId) return;

    return subscribeToAdminFormulas(
      companyId,
      () => {
        void reload();
      },
    );
  }, [companyId, reload]);

  return {
    parameters,
    loading,
    error,
    reload,
  };
}
