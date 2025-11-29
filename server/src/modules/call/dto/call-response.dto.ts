import { Exclude, Expose, Type } from 'class-transformer';
import { CallStatus } from '@shared/types/call';
import { ChatResponseDto } from '@/modules/chat/dto/responses/chat-response.dto';
import { ChatMemberResponseDto } from '@/modules/chat-member/dto/responses/chat-member-response.dto';
import { CallResponse } from '@shared/types/responses/call.response';

@Exclude()
export class CallResponseDto implements CallResponse {
  @Expose() id: string;

  @Expose()
  @Type(() => ChatResponseDto)
  chat?: ChatResponseDto | null;

  @Expose() status: CallStatus;

  @Expose() isVideoCall: boolean;

  @Expose()
  initiator: ChatMemberResponseDto | null;

  @Expose() startedAt: Date | null;
  @Expose() endedAt?: Date | null;
  @Expose() updatedAt?: Date | null;
  @Expose() createdAt: Date;
}
