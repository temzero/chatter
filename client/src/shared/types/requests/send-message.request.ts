import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";

export interface SendMessageRequest {
  id?: string;
  chatId: string;
  memberId?: string;
  content?: string;
  replyToMessageId?: string | null;
  attachments?: AttachmentUploadRequest[];
}
