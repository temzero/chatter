import { AttachmentUploadRequest } from "@/types/requests/sendMessage.request";
import { AttachmentType } from "@/types/enums/attachmentType";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with proper checks
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

function determineAttachmentType(file: File): AttachmentType {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) return AttachmentType.IMAGE;
  if (mime.startsWith("video/")) return AttachmentType.VIDEO;
  if (mime.startsWith("audio/")) return AttachmentType.AUDIO;
  return AttachmentType.FILE;
}

export async function convertToAttachmentPayload(
  file: File
): Promise<AttachmentUploadRequest | null> {
  try {
    // 2GB file size limit
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(
        `File size exceeds ${MAX_SIZE / 1024 / 1024 / 1024}GB limit`
      );
    }

    const type = determineAttachmentType(file);
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, "_");
    const path = `${type}/${Date.now()}-${sanitizedFilename}`;

    const { error: uploadError } = await supabase.storage
      .from(attachmentsBucket) // Using hardcoded bucket name
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(attachmentsBucket).getPublicUrl(path);

    return {
      url: publicUrl,
      type,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      // path // Storing path for future management
    };
  } catch (error) {
    console.error("File upload failed:", error);
    return null;
  }
}
