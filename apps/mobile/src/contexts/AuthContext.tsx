import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  ApiError,
  type AppProfile,
  type AppRole,
  clearStoredSession,
  getCurrentUser,
  loadStoredSession,
  login,
  logout,
  register,
  type StoredSession,
  updateContractorProfile as updateContractorProfileRequest,
  updateOwnProfile
} from "@/services/api";

export type {
  AppProfile,
  AppRole
};

export type PublicAppRole =
  Exclude<AppRole, "super_admin">;

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

type AuthError = {
  message: string;
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
  session: StoredSession | null;
  user: AppProfile | null;
  profile: AppProfile | null;
  loading: boolean;
  profileError: string | null;
  isAdmin: boolean;

  refreshProfile: () => Promise<void>;

  updateProfile: (
    input: UpdateProfileInput
  ) => Promise<UpdateProfileResult>;

  signIn: (
    email: string,
    password: string
  ) => Promise<AuthResult>;

  signUp: (
    input: SignUpInput
  ) => Promise<AuthResult>;

  signOut: () => Promise<AuthResult>;

  resetPassword: (
    email: string
  ) => Promise<AuthResult>;

  updateContractorProfile: (
    input: UpdateContractorProfileInput
  ) => Promise<{
    error: string | null;
  }>;
};

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  );

function errorMessage(
  error: unknown
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
}

export function AuthProvider({
  children
}: PropsWithChildren) {
  const [session, setSession] =
    useState<StoredSession | null>(null);

  const [profile, setProfile] =
    useState<AppProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState<string | null>(null);

  const applySession = useCallback(
    (
      nextSession:
        | StoredSession
        | null
    ) => {
      setSession(nextSession);
      setProfile(
        nextSession?.user ?? null
      );
      setProfileError(null);
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const stored =
          await loadStoredSession();

        if (!stored) return;

        const current =
          await getCurrentUser();

        const nextSession: StoredSession = {
          ...stored,
          user: current.user,
          requiresApproval:
            current.requiresApproval
        };

        if (mounted) {
          applySession(nextSession);
        }
      } catch (error) {
        await clearStoredSession();

        if (mounted) {
          setProfileError(
            errorMessage(error)
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [applySession]);

  const refreshProfile =
    useCallback(async () => {
      if (!session) {
        setProfile(null);
        return;
      }

      try {
        const current =
          await getCurrentUser();

        const nextSession: StoredSession = {
          ...session,
          user: current.user,
          requiresApproval:
            current.requiresApproval
        };

        applySession(nextSession);
      } catch (error) {
        setProfileError(
          errorMessage(error)
        );
      }
    }, [applySession, session]);

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<AuthResult> => {
      try {
        const nextSession = await login(
          email.trim().toLowerCase(),
          password
        );

        applySession(nextSession);

        return {
          error: null
        };
      } catch (error) {
        return {
          error: {
            message: errorMessage(error)
          }
        };
      }
    },
    [applySession]
  );

  const signUp = useCallback(
    async (
      input: SignUpInput
    ): Promise<AuthResult> => {
      try {
        const nextSession =
          await register({
            fullName:
              input.fullName.trim(),
            firstName:
              input.firstName.trim(),
            lastName:
              input.lastName.trim(),
            phone:
              input.phone?.trim() || "",
            email:
              input.email
                .trim()
                .toLowerCase(),
            password: input.password,
            role: input.role,
            province: input.province,
            district: input.district,
            corregimiento:
              input.corregimiento,
            termsAccepted:
              input.termsAccepted,
            notificationsOptIn:
              input.notificationsOptIn,
            registrationDevice:
              input.registrationDevice
          });

        applySession(nextSession);

        return {
          error: null,
          requiresEmailConfirmation:
            !!nextSession.requiresEmailConfirmation
        };
      } catch (error) {
        return {
          error: {
            message: errorMessage(error)
          }
        };
      }
    },
    [applySession]
  );

  const signOut = useCallback(
    async (): Promise<AuthResult> => {
      try {
        await logout();
        applySession(null);

        return {
          error: null
        };
      } catch (error) {
        applySession(null);

        return {
          error: {
            message: errorMessage(error)
          }
        };
      }
    },
    [applySession]
  );

  const updateProfile = useCallback(
    async ({
      fullName,
      phone = ""
    }: UpdateProfileInput):
    Promise<UpdateProfileResult> => {
      try {
        await updateOwnProfile({
          fullName:
            fullName.trim(),
          phone:
            phone.trim() || null
        });

        await refreshProfile();

        return {
          error: null
        };
      } catch (error) {
        return {
          error: errorMessage(error)
        };
      }
    },
    [refreshProfile]
  );

  const updateContractorProfile =
    useCallback(
      async (
        input:
          UpdateContractorProfileInput
      ): Promise<{
        error: string | null;
      }> => {
        try {
          await updateContractorProfileRequest(
            input
          );

          await refreshProfile();

          return {
            error: null
          };
        } catch (error) {
          return {
            error: errorMessage(error)
          };
        }
      },
      [refreshProfile]
    );

  const resetPassword = useCallback(
    async (
      _email: string
    ): Promise<AuthResult> => {
      return {
        error: {
          message:
            "La recuperación de contraseña se habilitará al conectar el servicio de correo."
        }
      };
    },
    []
  );

  const isAdmin = Boolean(
    profile?.active &&
    profile.role === "super_admin"
  );

  const value =
    useMemo<AuthContextValue>(
      () => ({
        session,
        user: profile,
        profile,
        loading,
        profileError,
        isAdmin,
        refreshProfile,
        updateProfile,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateContractorProfile
      }),
      [
        session,
        profile,
        loading,
        profileError,
        isAdmin,
        refreshProfile,
        updateProfile,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateContractorProfile
      ]
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth():
AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}