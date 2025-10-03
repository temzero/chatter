import { Exclude, Expose, Type } from 'class-transformer';
import { CallStatus } from '../type/callStatus';
// import { Chat } from 'src/modules/chat/entities/chat.entity';
import { ChatResponseDto } from 'src/modules/chat/dto/responses/chat-response.dto';
import { ChatMemberResponseDto } from 'src/modules/chat-member/dto/responses/chat-member-response.dto';

@Exclude()
export class CallResponseDto {
  @Expose() id: string;

  @Expose()
  @Type(() => ChatResponseDto)
  chat?: ChatResponseDto | null; // ✅ optional + nullable

  // @Expose()
  // @Type(() => Chat)
  // chat: Chat;

  @Expose() status: CallStatus;

  @Expose() isVideoCall: boolean;

  @Expose()
  initiator: ChatMemberResponseDto | null;

  @Expose() startedAt: Date | null;
  @Expose() endedAt?: Date | null;
  @Expose() updatedAt?: Date | null;
  @Expose() createdAt: Date;
}
