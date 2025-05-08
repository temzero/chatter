import type { Message } from "./message";

export type Chat = PrivateChat | GroupChat;

export interface PrivateChat {
  id: string;
  type: 'private';
  name: string;
  chatPartner: ChatPartner;
  lastMessage?: Message | null;
  pinnedMessage?: Message | null;
  updatedAt: Date; // or Date, depending on your serialization
}

export interface GroupChat {
  id: string;
  type: 'group' | 'channel';
  name: string;
  avatar?: string;
  description?: string | null;
  lastMessage?: Message | null;
  pinnedMessage?: Message | null;
  updatedAt: Date;
}

export interface ChatPartner {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  bio?: string | null;
  phone_number?: string | null;
  birthday?: Date | null;
  status?: string | null;
  last_seen?: Date | null;
}

