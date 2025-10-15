import { CallStatus } from 'src/shared/types/enums/call-status.enum';
import { ChatResponse } from './chat.response';
import { ChatMember } from './chat-member.response';

export interface CallResponse {
  id: string;
  chat?: ChatResponse | null;
  status: CallStatus;
  isVideoCall: boolean;
  initiator: ChatMember | null;
  startedAt: Date | null;
  endedAt?: Date | null;
  updatedAt?: Date | null;
  createdAt: Date;
}
