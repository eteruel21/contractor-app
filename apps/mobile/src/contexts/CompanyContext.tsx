import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  createCompanyRecord,
  listCompanyMemberships
} from "@/services/company-service";
import type {
  Company,
  CompanyMembership
} from "@/types/company";

const ACTIVE_COMPANY_KEY =
  "@contractor-pro:active-company-id";

type CreateCompanyInput = {
  name: string;
  phone?: string;
  email?: string;
};

type CompanyContextValue = {
  memberships: CompanyMembership[];
  companies: Company[];
  activeCompany: Company | null;
  activeMembership:
    | CompanyMembership
    | null;
  loading: boolean;
  refreshing: boolean;

  refreshCompanies: () => Promise<void>;

  setActiveCompanyId: (
    companyId: string
  ) => Promise<void>;

  createCompany: (
    input: CreateCompanyInput
  ) => Promise<{
    companyId: string | null;
    error: string | null;
  }>;
};

const CompanyContext =
  createContext<CompanyContextValue | null>(
    null
  );

export function CompanyProvider({
  children
}: PropsWithChildren) {
  const {
    user,
    profile,
    loading: authLoading
  } = useAuth();

  const userId =
    profile?.active
      ? user?.id ?? null
      : null;

  const [memberships, setMemberships] =
    useState<CompanyMembership[]>([]);

  const [
    activeCompanyId,
    setActiveCompanyIdState
  ] = useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const companies = useMemo(
    () =>
      memberships
        .map(
          (membership) =>
            membership.company
        )
        .filter(Boolean),
    [memberships]
  );

  const activeCompany = useMemo(
    () =>
      companies.find(
        (company) =>
          company.id === activeCompanyId
      ) ?? null,
    [
      activeCompanyId,
      companies
    ]
  );

  const activeMembership = useMemo(
    () =>
      memberships.find(
        (membership) =>
          membership.company_id ===
          activeCompanyId
      ) ?? null,
    [
      activeCompanyId,
      memberships
    ]
  );

  const refreshCompanies =
    useCallback(async () => {
      if (!userId) {
        setMemberships([]);
        setActiveCompanyIdState(null);
        setLoading(false);
        setRefreshing(false);

        await AsyncStorage.removeItem(
          ACTIVE_COMPANY_KEY
        );

        return;
      }

      setRefreshing(true);

      try {
        const result =
          await listCompanyMemberships();

        if (result.error) {
          throw new Error(result.error);
        }

        setMemberships(
          result.memberships
        );

        const storedCompanyId =
          await AsyncStorage.getItem(
            ACTIVE_COMPANY_KEY
          );

        const storedCompanyExists =
          result.memberships.some(
            (membership) =>
              membership.company_id ===
              storedCompanyId
          );

        if (
          storedCompanyId &&
          storedCompanyExists
        ) {
          setActiveCompanyIdState(
            storedCompanyId
          );

          return;
        }

        const firstCompanyId =
          result.memberships[0]
            ?.company_id ?? null;

        setActiveCompanyIdState(
          firstCompanyId
        );

        if (firstCompanyId) {
          await AsyncStorage.setItem(
            ACTIVE_COMPANY_KEY,
            firstCompanyId
          );
        } else {
          await AsyncStorage.removeItem(
            ACTIVE_COMPANY_KEY
          );
        }
      } catch (error) {
        console.error(
          "Error cargando empresas:",
          error
        );

        setMemberships([]);
        setActiveCompanyIdState(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [userId]);

  useEffect(() => {
    if (authLoading) return;

    setLoading(true);
    void refreshCompanies();
  }, [
    authLoading,
    refreshCompanies
  ]);

  const setActiveCompanyId =
    useCallback(
      async (companyId: string) => {
        const exists =
          memberships.some(
            (membership) =>
              membership.company_id ===
              companyId
          );

        if (!exists) {
          throw new Error(
            "No tienes acceso a esta empresa."
          );
        }

        setActiveCompanyIdState(
          companyId
        );

        await AsyncStorage.setItem(
          ACTIVE_COMPANY_KEY,
          companyId
        );
      },
      [memberships]
    );

  const createCompany =
    useCallback(
      async ({
        name,
        phone = "",
        email = ""
      }: CreateCompanyInput) => {
        const cleanName = name.trim();

        if (cleanName.length < 2) {
          return {
            companyId: null,
            error:
              "El nombre de la empresa es obligatorio."
          };
        }

        const result =
          await createCompanyRecord({
            name: cleanName,
            phone,
            email
          });

        if (
          result.error ||
          !result.companyId
        ) {
          return result;
        }

        await refreshCompanies();

        setActiveCompanyIdState(
          result.companyId
        );

        await AsyncStorage.setItem(
          ACTIVE_COMPANY_KEY,
          result.companyId
        );

        return result;
      },
      [refreshCompanies]
    );

  const value =
    useMemo<CompanyContextValue>(
      () => ({
        memberships,
        companies,
        activeCompany,
        activeMembership,
        loading,
        refreshing,
        refreshCompanies,
        setActiveCompanyId,
        createCompany
      }),
      [
        memberships,
        companies,
        activeCompany,
        activeMembership,
        loading,
        refreshing,
        refreshCompanies,
        setActiveCompanyId,
        createCompany
      ]
    );

  return (
    <CompanyContext.Provider
      value={value}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany():
CompanyContextValue {
  const context =
    useContext(CompanyContext);

  if (!context) {
    throw new Error(
      "useCompany debe utilizarse dentro de CompanyProvider."
    );
  }

  return context;
}