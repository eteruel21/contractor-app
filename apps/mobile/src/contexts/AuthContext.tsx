import type {
    AuthError,
    Session,
    User,
} from "@supabase/supabase-js";
import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { supabase } from "@/services/supabase";

type SignUpInput = {
  fullName: string;
  phone?: string;
  email: string;
  password: string;
};

type AuthResult = {
  error: AuthError | null;
  requiresEmailConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

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

      setSession(currentSession);
      setLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    return { error };
  }

  async function signUp({
    fullName,
    phone = "",
    email,
    password,
  }: SignUpInput): Promise<AuthResult> {
    const { data, error } =
      await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

    return {
      error,
      requiresEmailConfirmation:
        !error && !data.session,
    };
  }

  async function signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut();

    return { error };
  }

  async function resetPassword(
    email: string,
  ): Promise<AuthResult> {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
      );

    return { error };
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [loading, session],
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