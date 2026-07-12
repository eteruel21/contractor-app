import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase";
import type {
  Company,
  CompanyMembership,
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
  activeMembership: CompanyMembership | null;
  loading: boolean;
  refreshing: boolean;
  refreshCompanies: () => Promise<void>;
  setActiveCompanyId: (
    companyId: string,
  ) => Promise<void>;
  createCompany: (
    input: CreateCompanyInput,
  ) => Promise<{
    companyId: string | null;
    error: string | null;
  }>;
};

const CompanyContext =
  createContext<CompanyContextValue | null>(null);

export function CompanyProvider({
  children,
}: PropsWithChildren) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [memberships, setMemberships] =
    useState<CompanyMembership[]>([]);
  const [activeCompanyId, setActiveCompanyIdState] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const companies = useMemo(
    () =>
      memberships
        .map((membership) => membership.company)
        .filter(Boolean),
    [memberships],
  );

  const activeCompany = useMemo(() => {
    if (!activeCompanyId) return null;

    return (
      companies.find(
        (company) => company.id === activeCompanyId,
      ) ?? null
    );
  }, [activeCompanyId, companies]);

  const activeMembership = useMemo(() => {
    if (!activeCompanyId) return null;

    return (
      memberships.find(
        (membership) =>
          membership.company_id === activeCompanyId,
      ) ?? null
    );
  }, [activeCompanyId, memberships]);

  const refreshCompanies = useCallback(async () => {
    if (!userId) {
      setMemberships([]);
      setActiveCompanyIdState(null);
      setLoading(false);
      return;
    }

    setRefreshing(true);

    try {
      const { data, error } = await supabase
        .from("company_members")
        .select(
          `
          id,
          company_id,
          user_id,
          role,
          active,
          company:companies (
            id,
            name,
            legal_name,
            tax_id,
            phone,
            email,
            address,
            logo_url,
            currency_code,
            tax_rate,
            timezone,
            quotation_prefix,
            invoice_prefix,
            receipt_prefix,
            project_prefix,
            payment_prefix,
            created_by,
            active,
            created_at,
            updated_at
          )
        `,
        )
        .eq("user_id", userId)
        .eq("active", true)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const parsedMemberships =
        (data ?? [])
          .map((row) => {
            const companyValue = Array.isArray(
              row.company,
            )
              ? row.company[0]
              : row.company;

            if (!companyValue) return null;

            return {
              id: row.id,
              company_id: row.company_id,
              user_id: row.user_id,
              role: row.role,
              active: row.active,
              company: companyValue as Company,
            } satisfies CompanyMembership;
          })
          .filter(
            (
              membership,
            ): membership is CompanyMembership =>
              Boolean(membership),
          );

      setMemberships(parsedMemberships);

      const storedCompanyId =
        await AsyncStorage.getItem(
          ACTIVE_COMPANY_KEY,
        );

      const storedCompanyExists =
        parsedMemberships.some(
          (membership) =>
            membership.company_id === storedCompanyId,
        );

      if (
        storedCompanyId &&
        storedCompanyExists
      ) {
        setActiveCompanyIdState(storedCompanyId);
        return;
      }

      const firstCompanyId =
        parsedMemberships[0]?.company_id ?? null;

      setActiveCompanyIdState(firstCompanyId);

      if (firstCompanyId) {
        await AsyncStorage.setItem(
          ACTIVE_COMPANY_KEY,
          firstCompanyId,
        );
      } else {
        await AsyncStorage.removeItem(
          ACTIVE_COMPANY_KEY,
        );
      }
    } catch (error) {
      console.error(
        "Error cargando empresas:",
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;

    setLoading(true);
    void refreshCompanies();
  }, [authLoading, refreshCompanies]);

  async function setActiveCompanyId(
    companyId: string,
  ) {
    const exists = memberships.some(
      (membership) =>
        membership.company_id === companyId,
    );

    if (!exists) {
      throw new Error(
        "No tienes acceso a esta empresa.",
      );
    }

    setActiveCompanyIdState(companyId);

    await AsyncStorage.setItem(
      ACTIVE_COMPANY_KEY,
      companyId,
    );
  }

  async function createCompany({
    name,
    phone = "",
    email = "",
  }: CreateCompanyInput) {
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      return {
        companyId: null,
        error: "El nombre de la empresa es obligatorio.",
      };
    }

    const { data, error } =
      await supabase.rpc("create_company", {
        company_name: cleanName,
        company_phone: phone.trim() || undefined,
        company_email:
          email.trim().toLowerCase() || undefined,
      });

    if (error) {
      return {
        companyId: null,
        error: error.message,
      };
    }

    const newCompanyId =
      typeof data === "string" ? data : null;

    await refreshCompanies();

    if (newCompanyId) {
      setActiveCompanyIdState(newCompanyId);
      await AsyncStorage.setItem(
        ACTIVE_COMPANY_KEY,
        newCompanyId,
      );
    }

    return {
      companyId: newCompanyId,
      error: null,
    };
  }

  const value = useMemo<CompanyContextValue>(
    () => ({
      memberships,
      companies,
      activeCompany,
      activeMembership,
      loading,
      refreshing,
      refreshCompanies,
      setActiveCompanyId,
      createCompany,
    }),
    [
      memberships,
      companies,
      activeCompany,
      activeMembership,
      loading,
      refreshing,
    ],
  );

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error(
      "useCompany debe utilizarse dentro de CompanyProvider.",
    );
  }

  return context;
}
