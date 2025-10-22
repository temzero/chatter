import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import supabase, { attachmentsBucket } from "@/common/utils/supabaseClient";
import { toast } from "react-toastify";

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
    } catch (error) {
      console.error(`❌ Failed to upload file ${file.name}:`, error);
      toast.error(`Failed to upload "${file.name}". Please try again.`);
      // ❗ Stop all uploads if one fails
      throw new Error(`Upload failed for ${file.name}`);
    }
  }

  return uploads;
}
