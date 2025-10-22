import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const attachmentsBucket =
  import.meta.env.VITE_SUPABASE_ATTACHMENTS_BUCKET ?? "attachments";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables not configured! Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
