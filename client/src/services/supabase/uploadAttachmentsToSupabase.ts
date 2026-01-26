import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { handleError } from "@/common/utils/error/handleError";
import SupabaseService, {
  attachmentsBucket,
  thumbnailsBucket,
} from "./supabaseService";
import { toast } from "react-toastify";
import i18next from "i18next";
import { ProcessedAttachment } from "@/shared/types/responses/message-attachment.response";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";

/**
 * Upload processed attachments to Supabase (files + thumbnails)
 */
export async function uploadAttachmentsToSupabase(
  processedAttachments: ProcessedAttachment[],
): Promise<AttachmentUploadRequest[]> {
  const t = i18next.t;
  const uploads: AttachmentUploadRequest[] = [];

  try {
    const uploadPromises = processedAttachments.map(async (attachment) => {
      const { file, thumbnailUrl } = attachment;

      if (!file) {
        throw new Error(`No file found for attachment: ${attachment.filename}`);
      }

      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_.]/g, "_");
      const timestamp = Date.now();
      const type = determineAttachmentType(file)
      const filePath = `${type}/${timestamp}-${sanitizedFilename}`;

      // Upload main file
      const fileUrl = await SupabaseService.uploadFile(
        file,
        attachmentsBucket,
        filePath,
        false,
      );

      let uploadedThumbnailUrl: string | null = null;

      // Upload thumbnail if available
      if (thumbnailUrl) {
        try {
          // Convert blob URL to Blob
          const response = await fetch(thumbnailUrl);
          const thumbnailBlob = await response.blob();

          // Convert Blob to File
          const thumbnailFile = new File(
            [thumbnailBlob],
            `thumb-${sanitizedFilename}.jpg`,
            {
              type: thumbnailBlob.type || "image/jpeg",
              lastModified: Date.now(),
            },
          );

          const thumbnailPath = `${attachment.type}/${timestamp}-thumb-${sanitizedFilename}.jpg`;

          uploadedThumbnailUrl = await SupabaseService.uploadFile(
            thumbnailFile, // Pass File instead of Blob
            thumbnailsBucket,
            thumbnailPath,
            false,
          );
        } catch (thumbnailError) {
          console.warn(
            `Failed to upload thumbnail for ${file.name}:`,
            thumbnailError,
          );
          // Continue without thumbnail
        }
      }

      const upload: AttachmentUploadRequest = {
        url: fileUrl,
        type: attachment.type,
        filename: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        createdAt: new Date().toISOString(),
        thumbnailUrl: uploadedThumbnailUrl,
        // Include extracted metadata
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration,
      };

      return upload;
    });

    // Wait for all uploads to complete
    const results = await Promise.allSettled(uploadPromises);

    // Check for any failures
    const failedUploads = results.filter((r) => r.status === "rejected");
    if (failedUploads.length > 0) {
      throw new Error(`${failedUploads.length} attachment(s) failed to upload`);
    }

    // Get successful uploads
    const successfulUploads = results
      .filter(
        (r): r is PromiseFulfilledResult<AttachmentUploadRequest> =>
          r.status === "fulfilled",
      )
      .map((r) => r.value);

    console.log("Uploaded attachments to Supabase:", successfulUploads);
    return successfulUploads;
  } catch (error) {
    // Cleanup: Delete any successfully uploaded files
    const urlsToDelete: string[] = [];
    uploads.forEach((upload) => {
      if (upload.url) urlsToDelete.push(upload.url);
      if (upload.thumbnailUrl) urlsToDelete.push(upload.thumbnailUrl);
    });

    if (urlsToDelete.length > 0) {
      await SupabaseService.deleteFiles(urlsToDelete);
    }

    toast.error(t("common.messages.upload-failed"));
    handleError(error, t("common.messages.upload-failed"));
    throw error;
  }
}
