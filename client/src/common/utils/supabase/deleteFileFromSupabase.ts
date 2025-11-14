import supabase, { attachmentsBucket } from "../supabaseClient";

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
