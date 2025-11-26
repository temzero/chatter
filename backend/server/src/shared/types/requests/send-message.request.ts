import { AttachmentUploadRequest } from 'src/shared/types/requests/attachment-upload.request';

export interface CreateMessageRequest {
  id?: string;
  chatId: string;
  memberId?: string;
  content?: string;
  replyToMessageId?: string | null;
  attachments?: AttachmentUploadRequest[];
}
