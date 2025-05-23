import { ChatType } from '../../constants/chat-types.constants';
import { Exclude, Expose, Type } from 'class-transformer';
import { MessageResponseDto } from './message-response.dto';
import { ChatMemberResponseDto } from 'src/modules/chat-member/dto/responses/chat-member-response.dto';

@Exclude()
export class directChatResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: ChatType;

  @Expose()
  @Type(() => MessageResponseDto)
  lastMessage?: MessageResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

@Exclude()
export class groupChatResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: ChatType;

  @Expose()
  name?: string;

  @Expose()
  description?: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  isPublic: boolean;

  @Expose()
  @Type(() => MessageResponseDto)
  lastMessage?: MessageResponseDto;

  @Expose()
  @Type(() => ChatMemberResponseDto)
  members: ChatMemberResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
