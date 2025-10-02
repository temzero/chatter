// types/message-response.ts
import { MessageStatus } from "../enums/message";
import { MessageType } from "../enums/message";
import { AttachmentType } from "../enums/attachmentType";
import { SystemEventType } from "../enums/systemEventType";
import { CallLiteResponse } from "./callLite.response";

export interface MessageResponse {
  id: string;
  chatId: string;
  sender: SenderResponse;
  type: MessageType;
  content?: string | null;
  status: MessageStatus;
  isPinned: boolean;
  pinnedAt?: string | null;

  replyToMessageId?: string | null;
  replyToMessage: MessageResponse | null;
  replyCount: number;

  forwardedFromMessageId?: string | null;
  forwardedFromMessage: MessageResponse | null;

  isImportant?: boolean;
  systemEvent?: SystemEventType | null;
  editedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reactions?: Record<string, string[]>;
  attachments?: AttachmentResponse[];

  call?: CallLiteResponse;

  isMuted?: boolean;
  shouldAnimate?: boolean;
}

export interface LastMessageResponse {
  id: string;
  senderId: string;
  senderDisplayName: string;
  content?: string;
  icons?: string[];
  call?: CallLiteResponse;
  isForwarded?: boolean;
  systemEvent?: SystemEventType | null;
  createdAt: string;
}

export interface SenderResponse {
  id: string;
  avatarUrl?: string | null;
  displayName: string;
}

export interface ReactionResponse {
  id: string;
  emoji: string;
  userId: string;
  user?: SenderResponse;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}
