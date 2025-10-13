import { AttachmentUploadRequest } from "@/types/requests/sendMessage.request";
import { determineAttachmentType } from "../determineAttachmentType";
import { createClient } from "@supabase/supabase-js";
import { toast } from "react-toastify";

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

/**
 * Upload multiple files to Supabase and return their metadata
 */
export async function uploadFilesToSupabase(
  files: File[]
): Promise<AttachmentUploadRequest[]> {
  const uploads: AttachmentUploadRequest[] = [];

  for (const file of files) {
    try {
      const type = determineAttachmentType(file);
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, "_");
      const path = `${type}/${Date.now()}-${sanitizedFilename}`;

      const { error: uploadError } = await supabase.storage
        .from(attachmentsBucket)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(attachmentsBucket).getPublicUrl(path);

      uploads.push({
        url: publicUrl,
        type,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      });
    } catch (error) {
      console.error(`❌ Failed to upload file ${file.name}:`, error);
      toast.error(`Failed to upload "${file.name}". Please try again.`);
      // ❗ Stop all uploads if one fails
      throw new Error(`Upload failed for ${file.name}`);
    }
  }

  return uploads;
}
