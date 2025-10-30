import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import supabase, { attachmentsBucket } from "@/common/utils/supabaseClient";

/**
 * Upload multiple files to Supabase and return their metadata
 */
export async function uploadFilesToSupabase(
  files: File[]
): Promise<AttachmentUploadRequest[]> {
  const uploads: AttachmentUploadRequest[] = [];

  for (const file of files) {
    const type = determineAttachmentType(file);
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, "_");
    const path = `${type}/${Date.now()}-${sanitizedFilename}`;

    const { error: uploadError } = await supabase.storage
      .from(attachmentsBucket)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from(attachmentsBucket).getPublicUrl(path);
    console.log(`Uploaded ${file.name}:`, publicUrl);

    uploads.push({
      url: publicUrl,
      type,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    });
  }

  return uploads;
}
