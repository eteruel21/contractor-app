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

import { supabase } from "@/services/supabase";

export type AppRole = "super_admin" | "contractor" | "client";

export type AppProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type SignUpInput = {
  fullName: string;
  phone?: string;
  email: string;
  password: string;
  role?: AppRole;
};

type AuthResult = {
  error: AuthError | null;
  requiresEmailConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  loading: boolean;
  profileError: string | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
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

      setProfile(data as unknown as AppProfile | null);
      setProfileLoading(false);
    },
    [],
  );

  useEffect(() => {
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
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    await loadProfile(session.user.id);
  }, [loadProfile, session?.user]);

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
    async ({
      fullName,
      phone = "",
      email,
      password,
      role = "contractor",
    }: SignUpInput): Promise<AuthResult> => {
      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role,
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
    profile?.active && (
      profile.role === "contractor" ||
      profile.role === "super_admin" ||
      (profile.role as string) === "admin" ||
      !profile.role
    ),
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
