import { AttachmentType } from "../enums/attachmentType";

export interface SendMessageRequest {
  id: string;
  chatId: string;
  memberId: string;
  content?: string;
  replyToMessageId?: string | null;
  attachments?: AttachmentUploadRequest[];
}

export interface AttachmentUploadRequest {
  url: string;

  type: AttachmentType;
  filename: string;
  size: number;

  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
}
