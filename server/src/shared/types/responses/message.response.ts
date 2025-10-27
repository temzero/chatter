// types/message-response.ts
import { MessageStatus } from 'src/shared/types/enums/message-status.enum';
import { AttachmentType } from 'src/shared/types/enums/attachment-type.enum';
import { SystemEventType } from 'src/shared/types/enums/system-event-type.enum';
import { CallLiteResponse } from './call-lite.response';

export interface MessageResponse {
  id: string;
  chatId: string;
  sender: SenderResponse;
  content?: string | null;
  status: MessageStatus;
  isPinned: boolean;
  pinnedAt?: Date | string | null;

  replyToMessageId?: string | null;
  replyToMessage?: MessageResponse | null;
  replyCount: number;

  forwardedFromMessageId?: string | null;
  forwardedFromMessage?: MessageResponse | null;

  isImportant?: boolean;
  systemEvent?: SystemEventType | null;
  editedAt?: Date | string | null;
  isDeleted: boolean;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  reactions?: Record<string, string[]>;
  attachments?: AttachmentResponse[];

  call?: CallLiteResponse;

  isMuted?: boolean;
  shouldAnimate?: boolean;
}

export interface SenderResponse {
  id: string;
  avatarUrl?: string | null;
  displayName: string;
}

export interface AttachmentResponse {
  id: string;
  messageId: string;
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
  createdAt: Date | string;
  updatedAt: Date | string;
}
