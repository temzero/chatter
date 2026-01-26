import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import SupabaseService, { attachmentsBucket } from "./supabaseService";


/**
 * Upload a single thumbnail to Supabase
 */
export async function uploadThumbnailToSupabase(
  thumbnailUrl: string,
  filename: string,
): Promise<string | null> {
  try {
    // Convert blob URL to Blob
    const response = await fetch(thumbnailUrl);
    const thumbnailBlob = await response.blob();

    // Convert Blob to File
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_.]/g, "_");
    const timestamp = Date.now();
    const thumbnailFile = new File(
      [thumbnailBlob],
      `thumb-${sanitizedFilename}.jpg`,
      {
        type: thumbnailBlob.type || "image/jpeg",
        lastModified: Date.now(),
      },
    );

    const thumbnailPath = `${AttachmentType.IMAGE}/${timestamp}-thumb-${sanitizedFilename}.jpg`;

    const uploadedUrl = await SupabaseService.uploadFile(
      thumbnailFile,
      attachmentsBucket, // Same bucket as files
      thumbnailPath,
      false,
    );

    return uploadedUrl;
  } catch (thumbnailError) {
    console.warn(`Failed to upload thumbnail for ${filename}:`, thumbnailError);
    return null;
  }
}