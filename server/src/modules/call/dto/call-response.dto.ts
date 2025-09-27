import { Exclude, Expose, Type } from 'class-transformer';
import { CallStatus } from '../type/callStatus';
// import { ChatResponseDto } from '../../chat/dto/responses/chat-response.dto';
import { ChatMemberResponseDto } from '../../chat-member/dto/responses/chat-member-response.dto';
import { Chat } from 'src/modules/chat/entities/chat.entity';

@Exclude()
export class CallResponseDto {
  @Expose() id: string;

  @Expose()
  @Type(() => Chat)
  chat: Chat;

  @Expose() status: CallStatus;

  @Expose() isVideoCall: boolean;

  @Expose()
  initiator: ChatMemberResponseDto;

  @Expose() startedAt: Date | null;
  @Expose() endedAt?: Date | null;
  @Expose() updatedAt?: Date | null;
  @Expose() createdAt: Date;
}
