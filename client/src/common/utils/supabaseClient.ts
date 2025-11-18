import { createClient } from "@supabase/supabase-js";
import { EnvConfig } from "../config/env.config";

export const supabaseUrl = EnvConfig.supabase.url;
export const supabaseAnonKey = EnvConfig.supabase.anonKey;
export const attachmentsBucket = EnvConfig.supabase.attachmentsBucket;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables not configured! Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
