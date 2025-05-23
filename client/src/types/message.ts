export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'gif';

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface MessageMetadata {
  id: string;
  // Avoiding circular type by referencing only the message ID
  messageId: string;
  linkPreview?: LinkPreview;
  mentions?: string[];
  hashtags?: string[];
}

export interface MessageMedia {
  id: string;
  messageId: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  size?: number;     // bytes
  duration?: number; // seconds
  width?: number;
  height?: number;
}

export interface Chat {
  id: string;
  name?: string;
  // Add more fields as needed
}

export interface User {
  id: string;
  name?: string;
  avatarUrl?: string;
  // Add more fields as needed
}

export interface Message {
  id: string;
  sender: User;
  chat: Chat;
  content?: string;
  reply_to_message_id?: string;
  status: MessageStatus;
  reactions?: Record<string, string>;
  media_items?: MessageMedia[];
  metadata?: MessageMetadata;
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface DisplayMessage {
  senderName: string;
  content?: string;
  attachment?: MessageMetadata;
  createdAt: string;
}
