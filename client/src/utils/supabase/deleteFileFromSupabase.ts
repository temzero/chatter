import { createClient } from "@supabase/supabase-js";

// Supabase setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const attachmentsBucket =
  import.meta.env.VITE_SUPABASE_ATTACHMENTS_BUCKET ?? "attachments";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables not configured! Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function deleteFilesFromSupabase(urls: string[]) {
  for (const url of urls) {
    try {
      console.log(`Attempting to delete file from Supabase: ${url}`);
      // Extract the path relative to the bucket
      const path = url.split(`${attachmentsBucket}/`)[1];
      if (!path) continue;

      const { error } = await supabase.storage
        .from(attachmentsBucket)
        .remove([path]);

      if (error) throw error;

      console.log(`Deleted file from Supabase: ${url}`);
    } catch (error) {
      console.error(`Failed to delete file ${url}:`, error);
    }
  }
}
