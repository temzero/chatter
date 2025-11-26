import { CallError } from 'src/shared/types/enums/call-error.enum';

export interface CallErrorResponse {
  reason: CallError;
  callId?: string;
  chatId?: string;
}
