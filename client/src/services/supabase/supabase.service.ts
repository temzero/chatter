import { EnvConfig } from "@/common/config/env.config";
import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = EnvConfig.supabase.url;
export const supabaseAnonKey = EnvConfig.supabase.anonKey;
export const avatarBucket = EnvConfig.supabase.avatarBucket;
export const attachmentsBucket = EnvConfig.supabase.attachmentsBucket;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables not configured! Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SupabaseService = {
  supabase,
  avatarBucket,
  attachmentsBucket,

  /**
   * Upload a file to Supabase bucket
   * @param file - File object to upload
   * @param bucket - Bucket name
   * @param path - Path in the bucket (folder + filename)
   * @param upsert - Whether to overwrite existing file (default: false)
   * @returns Public URL of uploaded file
   */
  uploadFile: async (
    file: File,
    bucket: string,
    path: string,
    upsert = false
  ): Promise<string> => {
    if (!file) throw new Error("No file provided");

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert,
      cacheControl: "3600",
    });

    if (error) {
      console.error(`[Supabase] Upload failed for bucket "${bucket}":`, error);
      throw new Error(`Failed to upload file to bucket ${bucket}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    if (!publicUrl) throw new Error("Failed to get public URL after upload");

    console.log(`[Supabase] Uploaded file to ${bucket}:`, publicUrl);
    return publicUrl;
  },

  /**
   * Delete files from Supabase bucket by their public URLs
   * @param urls - Array of public URLs to delete
   * @param bucket - Bucket name (optional, defaults to attachmentsBucket)
   */
  deleteFiles: async (urls: string[], bucket?: string) => {
    const targetBucket = bucket || attachmentsBucket;

    for (const url of urls) {
      try {
        console.log(`Attempting to delete file from Supabase: ${url}`);
        // Extract path relative to /public/ folder
        const path = url.split(`${supabaseUrl}/storage/v1/object/public/`)[1];
        if (!path) continue;

        const { error } = await supabase.storage
          .from(targetBucket)
          .remove([path]);
        if (error) throw error;

        console.log(`Deleted file from Supabase: ${url}`);
      } catch (err) {
        console.error(`Failed to delete file ${url}:`, err);
      }
    }
  },
};

export default SupabaseService;
