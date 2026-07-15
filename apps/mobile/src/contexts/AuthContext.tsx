import type {
  AuthError,
  Session,
  User,
} from "@supabase/supabase-js";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  configureSupabaseAutoRefresh,
  supabase,
} from "@/services/supabase";

export type AppRole = "super_admin" | "contractor" | "client";

export type PublicAppRole = Exclude<AppRole, "super_admin">;

export type AppProfile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  active: boolean;
  province: string | null;
  district: string | null;
  corregimiento: string | null;
  terms_accepted: boolean;
  notifications_opt_in: boolean;
  registration_ip: string | null;
  registration_device: string | null;
  
  // Contractor fields
  business_name?: string | null;
  id_document?: string | null;
  tax_id?: string | null;
  tax_dv?: string | null;
  primary_category?: string | null;
  specialties?: string[] | null;
  experience_years?: number | null;
  work_areas?: string[] | null;
  professional_description?: string | null;
  company_logo_url?: string | null;
  portfolio_urls?: string[] | null;
  certifications?: string[] | null;
  availability?: string | null;
  preferred_contact_method?: string | null;
  emits_invoice?: boolean;
  has_transport?: boolean;
  work_mode?: string | null;
  
  // Verification & Docs
  doc_id_url?: string | null;
  doc_operation_notice_url?: string | null;
  doc_technical_certs_urls?: string[] | null;
  doc_references_url?: string | null;
  doc_address_proof_url?: string | null;
  
  created_at: string;
  updated_at: string;
};

type SignUpInput = {
  fullName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  password: string;
  role?: PublicAppRole;
  province: string;
  district: string;
  corregimiento: string;
  termsAccepted: boolean;
  notificationsOptIn: boolean;
  registrationIp: string;
  registrationDevice: string;
};

export type UpdateContractorProfileInput = {
  businessName: string | null;
  idDocument: string;
  taxId: string | null;
  taxDv: string | null;
  primaryCategory: string | null;
  specialties: string[] | null;
  experienceYears: number | null;
  workAreas: string[] | null;
  professionalDescription: string | null;
  companyLogoUrl: string | null;
  portfolioUrls: string[] | null;
  certifications: string[] | null;
  availability: string | null;
  preferredContactMethod: string | null;
  emitsInvoice: boolean;
  hasTransport: boolean;
  workMode: string | null;
  docIdUrl: string | null;
  docOperationNoticeUrl: string | null;
  docTechnicalCertsUrls: string[] | null;
  docReferencesUrl: string | null;
  docAddressProofUrl: string | null;
};

type AuthResult = {
  error: AuthError | null;
  requiresEmailConfirmation?: boolean;
};

type UpdateProfileInput = {
  fullName: string;
  phone?: string;
};

type UpdateProfileResult = {
  error: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  loading: boolean;
  profileError: string | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    input: UpdateProfileInput,
  ) => Promise<UpdateProfileResult>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signUp: (
    input: SignUpInput,
  ) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (
    email: string,
  ) => Promise<AuthResult>;
  updateContractorProfile: (
    input: UpdateContractorProfileInput,
  ) => Promise<{ error: string | null }>;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [session, setSession] =
    useState<Session | null>(null);
  const [profile, setProfile] =
    useState<AppProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] =
    useState<string | null>(null);

  const loadProfile = useCallback(
    async (userId: string) => {
      setProfileLoading(true);
      setProfileError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error(
          "Error cargando el perfil:",
          error.message,
        );
        setProfile(null);
        setProfileError(error.message);
        setProfileLoading(false);
        return;
      }

      setProfile(data);
      setProfileLoading(false);
    },
    [],
  );

  useEffect(() => {
    const stopAutoRefresh = configureSupabaseAutoRefresh();
    let mounted = true;

    async function applySession(
      nextSession: Session | null,
    ) {
      if (!mounted) return;

      setSession(nextSession);

      if (nextSession?.user) {
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
      }

      if (mounted) {
        setAuthLoading(false);
      }
    }

    async function loadSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error(
          "Error cargando la sesión:",
          error.message,
        );
      }

      await applySession(currentSession);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        setAuthLoading(true);
        void applySession(nextSession);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      stopAutoRefresh();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    await loadProfile(session.user.id);
  }, [loadProfile, session?.user]);

  const updateProfile = useCallback(
    async ({
      fullName,
      phone = "",
    }: UpdateProfileInput): Promise<UpdateProfileResult> => {
      if (!session?.user) {
        return { error: "No hay una sesión activa." };
      }

      const normalizedName = fullName.trim();
      const normalizedPhone = phone.trim();

      if (normalizedName.length < 2) {
        return {
          error: "El nombre debe tener al menos 2 caracteres.",
        };
      }

      const { error } = await supabase.rpc(
        "update_own_profile",
        {
          p_full_name: normalizedName,
          p_phone: normalizedPhone || null,
        },
      );

      if (error) {
        return { error: error.message };
      }

      await loadProfile(session.user.id);
      return { error: null };
    },
    [loadProfile, session?.user],
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<AuthResult> => {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      return { error };
    },
    [],
  );

  const signUp = useCallback(
    async (input: SignUpInput): Promise<AuthResult> => {
      const { data, error } =
        await supabase.auth.signUp({
          email: input.email.trim().toLowerCase(),
          password: input.password,
          options: {
            data: {
              full_name: input.fullName.trim(),
              first_name: input.firstName.trim(),
              last_name: input.lastName.trim(),
              phone: input.phone?.trim() || "",
              role: input.role,
              province: input.province,
              district: input.district,
              corregimiento: input.corregimiento,
              terms_accepted: input.termsAccepted,
              notifications_opt_in: input.notificationsOptIn,
              registration_ip: input.registrationIp,
              registration_device: input.registrationDevice,
            },
          },
        });

      return {
        error,
        requiresEmailConfirmation:
          !error && !data.session,
      };
    },
    [],
  );

  const updateContractorProfile = useCallback(
    async (
      input: UpdateContractorProfileInput,
    ): Promise<{ error: string | null }> => {
      if (!session?.user) {
        return { error: "No hay una sesión activa." };
      }

      const { error } = await supabase.rpc(
        "update_contractor_profile",
        {
          p_business_name: input.businessName,
          p_id_document: input.idDocument || "",
          p_tax_id: input.taxId,
          p_tax_dv: input.taxDv,
          p_primary_category: input.primaryCategory,
          p_specialties: input.specialties,
          p_experience_years: input.experienceYears,
          p_work_areas: input.workAreas,
          p_professional_description: input.professionalDescription,
          p_company_logo_url: input.companyLogoUrl,
          p_portfolio_urls: input.portfolioUrls,
          p_certifications: input.certifications,
          p_availability: input.availability,
          p_preferred_contact_method: input.preferredContactMethod,
          p_emits_invoice: input.emitsInvoice,
          p_has_transport: input.hasTransport,
          p_work_mode: input.workMode,
          p_doc_id_url: input.docIdUrl,
          p_doc_operation_notice_url: input.docOperationNoticeUrl,
          p_doc_technical_certs_urls: input.docTechnicalCertsUrls,
          p_doc_references_url: input.docReferencesUrl,
          p_doc_address_proof_url: input.docAddressProofUrl,
        },
      );

      if (error) {
        return { error: error.message };
      }

      await loadProfile(session.user.id);
      return { error: null };
    },
    [loadProfile, session?.user],
  );

  const signOut = useCallback(
    async (): Promise<AuthResult> => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<AuthResult> => {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
        );

      return { error };
    },
    [],
  );

  const loading =
    authLoading || (Boolean(session) && profileLoading);

  const isAdmin = Boolean(
    profile?.active && profile.role === "super_admin",
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      profileError,
      isAdmin,
      refreshProfile,
      updateProfile,
      updateContractorProfile,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [
      isAdmin,
      loading,
      profile,
      profileError,
      refreshProfile,
      updateProfile,
      updateContractorProfile,
      resetPassword,
      session,
      signIn,
      signOut,
      signUp,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider.",
    );
  }

  return context;
}
