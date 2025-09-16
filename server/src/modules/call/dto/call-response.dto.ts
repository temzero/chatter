import { Exclude, Expose, Type } from 'class-transformer';
import { CallStatus, PendingCallStatus } from '../type/callStatus';
import { ChatResponseDto } from '../../chat/dto/responses/chat-response.dto';
import { ChatMemberResponseDto } from '../../chat-member/dto/responses/chat-member-response.dto';

@Exclude()
export class CallResponseDto {
  @Expose() id: string;

  @Expose()
  @Type(() => ChatResponseDto)
  chat: ChatResponseDto;

  @Expose() status: CallStatus | PendingCallStatus;

  @Expose() isVideoCall: boolean;
  @Expose() isGroupCall: boolean;

  @Expose()
  initiator: ChatMemberResponseDto;

  @Expose() startedAt: Date;
  @Expose() endedAt?: Date | null;
  @Expose() updatedAt?: Date | null;
  @Expose() createdAt: Date;

  @Expose()
  participants: ChatMemberResponseDto[];
}
