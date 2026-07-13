import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../mobile/src/types/database";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://bbfkkgrjschhxjhsmkau.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Pfs7Keo7Jai2EwTd6mNocg_pukyX6jx";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
