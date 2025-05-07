import { User } from '@/types/user';
import { Message } from '@/types/message';

export type ChatType = 'private' | 'group' | 'channel';

export interface BaseChat {
  id: string;
  lastMessage: Message | null;
  pinnedMessage: Message | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrivateChat extends BaseChat {
  type: 'private';
  member1: User;
  member1_nickname: string | null;
  member2: User;
  member2_nickname: string | null;
}

export interface GroupChat {
  id: string;
  type: 'group' | 'channel';
  name: string;
  description?: string;
  avatar?: string;
  lastMessage?: Message;
  pinnedMessage?: Message;
  is_public: boolean;
  is_broadcast_only: boolean;
  createdAt: Date;
  updatedAt: Date;
  members?: GroupMember[];
}

export interface GroupMember {
  user_id: string;
  chat_group_id: string;
  user: User;
  nickname: string | null;
  is_admin: boolean;
  is_banned: boolean;
  muted_until: Date | null;
  joinedAt: Date;
  updatedAt?: Date;
}

export type Chat = PrivateChat | GroupChat;