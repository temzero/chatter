import { Exclude, Expose, Type } from 'class-transformer';
import { CallStatus } from '../type/callStatus';
import { Chat } from 'src/modules/chat/entities/chat.entity';
import { ChatMember } from 'src/modules/chat-member/entities/chat-member.entity';

@Exclude()
export class CallResponseDto {
  @Expose() id: string;

  @Expose()
  @Type(() => Chat)
  chat: Chat;

  @Expose() status: CallStatus;

  @Expose() isVideoCall: boolean;

  @Expose()
  initiator: ChatMember | null;

  @Expose() startedAt: Date | null;
  @Expose() endedAt?: Date | null;
  @Expose() updatedAt?: Date | null;
  @Expose() createdAt: Date;
}
