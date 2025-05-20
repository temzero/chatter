import { ChatType } from '../../constants/chat-types.constants';
import { Expose, Type } from 'class-transformer';
import { MessageResponseDto } from './message-response.dto';

export class ChatListResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: ChatType;

  @Expose()
  name?: string;

  @Expose()
  avatar?: string;

  @Expose()
  @Type(() => MessageResponseDto)
  lastMessage?: MessageResponseDto;

  // Other list-specific fields
  @Expose()
  unreadCount?: number;
}
