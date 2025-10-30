import { AttachmentType } from "../enums/attachment-type.enum";

export interface AttachmentResponse {
  id: string;
  messageId: string;
  chatId: string;
  type: AttachmentType;
  url: string;
  thumbnailUrl?: string | null;
  filename?: string | null;
  size?: number | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
