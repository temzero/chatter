// chat.dto.ts
import { Message } from 'src/modules/message/entities/message.entity';
import { ChatPartnerDto } from './chat-partner';

export type ChatDto = PrivateChatDto | GroupChatDto;

export interface PrivateChatDto {
  id: string;
  type: 'private';
  name: string;
  chatPartner: ChatPartnerDto;
  lastMessage?: Message | null;
  pinnedMessage?: Message | null;
  updatedAt: Date;
}

export interface GroupChatDto {
  id: string;
  type: 'group' | 'channel';
  name: string;
  avatar?: string;
  description?: string | null;
  lastMessage?: Message | null;
  pinnedMessage?: Message | null;
  updatedAt: Date;
}
