// types/message-response.ts
import { MessageStatus } from "./enums/message";
import { MessageType } from "./enums/message";
import { AttachmentType } from "./enums/attachmentType";

export interface SenderResponse {
  id: string;
  avatarUrl?: string | null;
  username: string;
  nickname?: string | null;
  firstName: string;
  lastName: string;
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

export interface MessageResponse {
  id: string;
  chatId: string;
  senderId: string;
  senderNickname: string;
  senderFirstName: string;
  senderLastName: string;
  senderAvatarUrl?: string | null;
  sender?: SenderResponse;
  type: MessageType;
  content?: string | null;
  status: MessageStatus;
  isPinned: boolean;
  pinnedAt?: string | null;
  replyToMessageId?: string | null;
  replyCount: number;
  editedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reactions?: ReactionResponse[];
  attachments?: AttachmentResponse[];
}
