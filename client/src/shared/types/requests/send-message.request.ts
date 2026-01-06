import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";

export interface CreateMessageRequest {
  id?: string;
  chatId: string;
  memberId?: string;
  replyToMessageId?: string | null;
  content?: string;
  attachments?: AttachmentUploadRequest[];
}
