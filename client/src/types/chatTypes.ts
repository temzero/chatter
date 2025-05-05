// src/types/chatTypes.ts
export type User = {
  id: string;
  username: string;
  phoneNumber?: string;
  avatar?: string;
  status?: "online" | "offline" | "away";
  lastSeen?: Date;
};

export type Message = {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  isEdited?: boolean;
  replyTo?: Message;
  attachments?: Attachment[];
};

export type Attachment = {
  type: "image" | "video" | "document" | "audio";
  url: string;
  name?: string;
  size?: number;
};

export type Chat = {
  id: string;
  type: "private" | "group" | "channel";
  title: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  avatar?: string;
};
