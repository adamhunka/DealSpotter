import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export typed Supabase client for use in services
export type SupabaseClient = BaseSupabaseClient<Database>;
