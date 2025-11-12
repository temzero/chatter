import logger from "../logger";
import supabase, { attachmentsBucket } from "../supabaseClient";

export async function deleteFilesFromSupabase(urls: string[]) {
  for (const url of urls) {
    try {
      logger.log(
        { prefix: "DATABASE" },
        `Attempting to delete file from Supabase: ${url}`
      );
      // Extract the path relative to the bucket
      const path = url.split(`${attachmentsBucket}/`)[1];
      if (!path) continue;

      const { error } = await supabase.storage
        .from(attachmentsBucket)
        .remove([path]);

      if (error) throw error;

      logger.log({ prefix: "DATABASE" }, `Deleted file from Supabase: ${url}`);
    } catch (error) {
      logger.error(`Failed to delete file ${url}:`, error);
    }
  }
}
