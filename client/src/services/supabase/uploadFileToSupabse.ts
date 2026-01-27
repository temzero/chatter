import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import SupabaseService, { attachmentsBucket } from "./supabaseService";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";

/**
 * Upload a single file to Supabase
 */
export async function uploadFileToSupabase(
  file: File,
): Promise<{ url: string; type: AttachmentType }> {
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
