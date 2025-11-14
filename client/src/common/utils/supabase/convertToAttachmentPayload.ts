import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import supabase, { attachmentsBucket } from "@/common/utils/supabaseClient";

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
