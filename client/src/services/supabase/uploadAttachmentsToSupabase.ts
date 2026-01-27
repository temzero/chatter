import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { handleError } from "@/common/utils/error/handleError";
import { toast } from "react-toastify";
import i18next from "i18next";
import { ProcessedAttachment } from "@/shared/types/responses/message-attachment.response";
import { uploadFileToSupabase } from "./uploadFileToSupabse";
import { uploadThumbnailToSupabase } from "./uploadThumbnailToSupabse";

/**
 * Upload processed attachments to Supabase (files + thumbnails)
 */
export async function uploadAttachmentsToSupabase(
  processedAttachments: ProcessedAttachment[],
): Promise<AttachmentUploadRequest[]> {
  console.log('processedAttachments:', processedAttachments)

  const t = i18next.t;

  const uploadPromises = processedAttachments.map(async (attachment) => {
    const { file, thumbnailUrl } = attachment;

    if (!file) {
      throw new Error(`No file found for attachment: ${attachment.filename}`);
    }

    // Upload main file
    const { url: fileUrl, type } = await uploadFileToSupabase(file);

    // Upload thumbnail
    let uploadedThumbnailUrl: string | null = null;
    if (thumbnailUrl) {
      uploadedThumbnailUrl = await uploadThumbnailToSupabase(
        thumbnailUrl,
        file.name,
      );
    }

    return {
      url: fileUrl,
      type,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      createdAt: new Date().toISOString(),
      thumbnailUrl: uploadedThumbnailUrl,
      width: attachment.width,
      height: attachment.height,
      duration: attachment.duration,
    };
  });

  try {
    const results = await Promise.allSettled(uploadPromises);
    
    // Check for failures
    const failedUploads = results.filter((r) => r.status === "rejected");
    if (failedUploads.length > 0) {
      // No cleanup needed - failed uploads didn't create files
      const errors = failedUploads
        .map((r: PromiseRejectedResult) => r.reason?.message || "Unknown error")
        .join(", ");
      throw new Error(`Upload failed: ${errors}`);
    }

    // Return successful uploads
    const successfulUploads = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<AttachmentUploadRequest>).value);

    return successfulUploads;
  } catch (error) {
    toast.error(t("common.messages.upload_failed"));
    handleError(error, t("common.messages.upload_failed"));
  }
}
