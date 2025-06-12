import { AttachmentType } from "./enums/attachmentType";
import { ChatMemberRole } from "./ChatMemberRole";
import { ChatType } from "./enums/ChatType";
import { FriendshipStatus } from "./friendship";

export type ChatResponse = DirectChatResponse | GroupChatResponse;

// Base interface for shared fields
export interface BaseChatResponse {
  id: string;
  myNickname: string | null;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: LastMessageResponse | null;
}

// Direct Chat Response
export interface DirectChatResponse extends BaseChatResponse {
  type: ChatType.DIRECT;
  chatPartner: ChatPartnerResponse;
}

// Group/Channel Chat Response
export interface GroupChatResponse extends BaseChatResponse {
  type: ChatType.GROUP | ChatType.CHANNEL;
  name: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  myRole?: ChatMemberRole;
  memberCount?: number;
}

// Simplified Chat Partner (similar to ChatPartnerDto)
export interface ChatPartnerResponse {
  nickname: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  email: string;
  phoneNumber: string | null;
  birthday: string | null;
  avatarUrl?: string | null;
  friendshipStatus?: FriendshipStatus | null;
}

// Last Message Response (similar to LastMessageResponseDto)
export interface LastMessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  content?: string;
  attachmentTypes?: AttachmentType;
  createdAt: string;
  icon?: string;
}

// Deprecated interfaces (keep if needed for backward compatibility)
export interface ChatPartner {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  email: string;
  phoneNumber: string | null;
  birthday: string | null | undefined;
  avatarUrl?: string | null;
}

export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  nickname: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isBanned: boolean;
  isAdmin: boolean;
}

export interface DisplayMessage {
  id: string;
  senderName: string;
  content?: string;
  attachmentTypes?: AttachmentType;
  createdAt: string;
}
