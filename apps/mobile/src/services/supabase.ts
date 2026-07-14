import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createClient,
  processLock,
} from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import type { Database } from "@/types/database";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Falta EXPO_PUBLIC_SUPABASE_URL en el archivo .env",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Falta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el archivo .env",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      ...(Platform.OS !== "web"
        ? { storage: AsyncStorage, lock: processLock }
        : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export function configureSupabaseAutoRefresh(): () => void {
  if (Platform.OS === "web") return () => undefined;

  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });

  if (AppState.currentState === "active") {
    supabase.auth.startAutoRefresh();
  }

  return () => {
    subscription.remove();
    supabase.auth.stopAutoRefresh();
  };
}
