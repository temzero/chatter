import { CallStatus } from '@shared/types/enums/call-status.enum';

export interface CallActionResponse {
  callId?: string;
  chatId: string;
  memberId: string;
  status?: CallStatus;
  createdAt?: string;
  startedAt?: string;
  endedAt?: string;
  isCallerCancel?: boolean;
}
