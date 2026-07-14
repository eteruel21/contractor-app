import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../mobile/src/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el entorno.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
