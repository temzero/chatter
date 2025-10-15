import { CallStatus } from 'src/shared/types/enums/call-status.enum';

export interface CallLiteResponse {
  id: string;
  status: CallStatus;
  startedAt?: Date | string;
  endedAt?: Date | string | null;
}
