import { AttachmentType } from "./attachment";

export type Chat = DirectChat | GroupChannelChat;

export type ChatType = "direct" | "group" | "channel";

export interface BaseChatResponse {
  id: string;
  type: ChatType;
  name: string;
  avatarUrl?: string | null;
  description?: string | null;
  updatedAt: Date;
  unreadCount?: number;
  lastMessage?: DisplayMessage;
}

export interface DirectChat extends BaseChatResponse {
  type: "direct";
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthday: string;
}

export interface GroupChannelChat extends BaseChatResponse {
  type: "group" | "channel";
  memberCount?: number;
}

// Deprecated interfaces (keep for backward compatibility if needed)
export interface ChatPartner {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthday: string;
  avatarUrl?: string | null;
}

export interface ChatGroupMember {
  id: string;
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
  // Add other message properties as needed
}
