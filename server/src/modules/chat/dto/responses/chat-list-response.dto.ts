import { ChatType } from '../../constants/chat-types.constants';
import { Exclude, Expose, Type } from 'class-transformer';
import { MessageResponseDto } from './message-response.dto';

@Exclude()
export class ChatListResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: ChatType;

  @Expose()
  name: string;

  @Expose()
  avatar?: string;

  @Expose()
  @Type(() => MessageResponseDto)
  lastMessage?: MessageResponseDto;

  @Expose()
  get lastMessageTimestamp(): string | null {
    return this.lastMessage?.createdAt?.toISOString() || null;
  }

  @Expose()
  unreadCount?: number;

  @Expose()
  updatedAt?: Date;
}
