import { CallStatus } from '@shared/types/enums/call-status.enum';
import { ChatResponse } from './chat.response';
import { ChatMemberResponse } from './chat-member.response';

export interface CallResponse {
  id: string;
  chat?: ChatResponse | null;
  status: CallStatus;
  isVideoCall: boolean;
  initiator: ChatMemberResponse | null;
  startedAt: Date | null;
  endedAt?: Date | null;
  updatedAt?: Date | null;
  createdAt: Date;
}
