import { Expose, Type } from 'class-transformer';
import { ChatMemberRole, ChatMemberStatus } from '../constants';
import { UserResponseDto } from '../../user/dto/responses/user-response.dto';
import { MessageReferenceDto } from '../../message/dto/responses/message-reference.dto';

export class ChatMemberResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  role: ChatMemberRole;

  @Expose()
  status: ChatMemberStatus;

  @Expose()
  nickname?: string;

  @Expose()
  customTitle?: string;

  @Expose()
  mutedUntil?: Date;

  @Expose()
  @Type(() => MessageReferenceDto)
  lastReadMessage?: MessageReferenceDto;

  @Expose()
  joinedAt: Date;
}
