// types/message-response.ts
import { MessageStatus } from '@shared/types/enums/message-status.enum';
import { SystemEventType } from '@shared/types/enums/system-event-type.enum';
import { CallLiteResponse } from './call-lite.response';
import { AttachmentResponse } from './message-attachment.response';

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
}

export interface SenderResponse {
  id: string;
  avatarUrl?: string | null;
  displayName: string;
}
