import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import SupabaseService, { attachmentsBucket } from "./supabaseService";

/**
 * Upload a single file to Supabase
 */
export async function uploadFileToSupabase(
  file: File,
): Promise<{ url: string; type: string }> {
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, "_");
  const timestamp = Date.now();
  const type = determineAttachmentType(file);
  const filePath = `${type}/${timestamp}-${sanitizedFilename}`;

  const url = await SupabaseService.uploadFile(
    file,
    attachmentsBucket,
    filePath,
    false,
  );

  return { url, type };
}
