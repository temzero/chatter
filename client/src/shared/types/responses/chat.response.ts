import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { LastMessageResponse, MessageResponse } from "./message.response";

export interface ChatResponse {
  id: string;
  type: ChatType;
  name: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  myMemberId: string;
  myRole?: ChatMemberRole;
  updatedAt?: string;
  otherMemberUserIds?: string[];
  pinnedMessage?: MessageResponse | null;
  lastMessage?: LastMessageResponse | null;
  unreadCount?: number;
  mutedUntil?: string | Date | null;
  inviteLinks?: string[];
  previewMembers?: ChatMemberLite[];
  pinnedAt?: Date | string | null;
  isDeleted?: boolean | null;
}

export interface ChatMemberLite {
  id: string;
  userId: string;
  avatarUrl?: string | null;
  nickname?: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface ChatWithMessagesResponse extends ChatResponse {
  messages: MessageResponse[];
  hasMoreMessages: boolean;
}
