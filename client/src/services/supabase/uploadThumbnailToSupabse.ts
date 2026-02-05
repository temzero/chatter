import SupabaseService, { attachmentsBucket } from "./supabaseService";

export async function uploadThumbnailToSupabase(
  fileName: string,
  thumbnailBlobUrl?: string,
): Promise<string | null> {
  if (!thumbnailBlobUrl) return null
  console.log("uploadThumbnailToSupabase thumbnailBlobUrl", thumbnailBlobUrl);
  try {
    const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9-_.]/g, "_");
    const timestamp = Date.now();

    // Convert blob URL to Blob and detect actual type
    const response = await fetch(thumbnailBlobUrl);
    const blob = await response.blob();

    // Get actual MIME type from blob
    const mimeType = blob.type || "image/jpeg";
    const extension = mimeType.split("/")[1] || "jpg"; // image/jpeg → jpeg

    const file = new File([blob], `thumb-${sanitizedFilename}`, {
      type: mimeType,
      lastModified: timestamp,
    });

    // Use correct extension from actual blob type
    const filePath = `thumbnails/${sanitizedFilename}-thumb-${timestamp}.${extension}`;

    const url = await SupabaseService.uploadFile(
      file,
      attachmentsBucket,
      filePath,
      false,
    );

    return url;
  } catch (error) {
    console.warn(`Failed to upload thumbnail for ${fileName}:`, error);
    return null;
  }
}
