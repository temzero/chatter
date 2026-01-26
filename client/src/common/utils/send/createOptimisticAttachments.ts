import { v4 as uuidv4 } from "uuid";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { determineAttachmentType } from "../message/determineAttachmentType";

export function createOptimisticAttachments(
  attachments: File[],
  filePreviewUrls: string[],
  messageId: string,
  chatId: string,
): AttachmentResponse[] {
  return attachments.map((file, index) => {
    const now = new Date(Date.now() + index).toISOString();

    return {
      id: uuidv4(),
      messageId,
      chatId,
      url: filePreviewUrls[index],
      type: determineAttachmentType(file),
      filename: file.name,
      size: file.size,
      mimeType: file.type || null,
      width: null,
      height: null,
      duration: null,
      thumbnailUrl: null,
      metadata: null,
      createdAt: now,
      updatedAt: now,
    };
  });
}
