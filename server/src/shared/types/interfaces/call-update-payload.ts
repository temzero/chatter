import { CallStatus } from '@shared/types/enums/call-status.enum';

export interface UpdateCallPayload {
  callId: string;
  chatId: string;
  initiatorUserId?: string;
  isVideoCall?: boolean;
  callStatus?: CallStatus;
  endedAt?: Date | string;
}
