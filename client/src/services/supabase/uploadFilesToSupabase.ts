import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import { handleError } from "@/common/utils/error/handleError";
import SupabaseService, { attachmentsBucket } from "./supabase.service";
import { toast } from "react-toastify";
import i18next from "i18next";

/**
 * Upload multiple files to Supabase and return their metadata
 */
export async function uploadFilesToSupabase(
  files: File[]
): Promise<AttachmentUploadRequest[]> {
  const t = i18next.t;
  const uploads: AttachmentUploadRequest[] = [];

  try {
    for (const file of files) {
      const type = determineAttachmentType(file);
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, "_");
      const path = `${type}/${Date.now()}-${sanitizedFilename}`;

      // Use SupabaseService.uploadFile instead of raw supabase.storage.upload
      const publicUrl = await SupabaseService.uploadFile(
        file,
        attachmentsBucket,
        path,
        false
      );

      uploads.push({
        url: publicUrl,
        type,
        filename: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        createdAt: new Date().toISOString(),
      });
    }

    console.log("uploaded to supabase storage", uploads);
    return uploads;
  } catch (error) {
    // Delete any successfully uploaded files if an error occurs
    const uploadedUrls = uploads.map((att) => att.url);
    if (uploadedUrls.length) await SupabaseService.deleteFiles(uploadedUrls);

    toast.error(t("common.messages.upload-failed"));
    handleError(error, t("common.messages.upload-failed"));
  }
}
