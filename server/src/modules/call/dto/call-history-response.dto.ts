// call-history.response.ts
import { Expose } from 'class-transformer';
import { CallStatus } from '../type/callStatus';

export class CallHistoryResponseDto {
  @Expose()
  callId: string;

  @Expose()
  chatId: string;

  @Expose()
  isVideoCall: boolean;

  @Expose()
  status: CallStatus;

  @Expose()
  startedAt: Date;

  @Expose()
  endedAt?: Date;

  // normalized display info
  @Expose()
  chatName: string;

  @Expose()
  chatAvatar: string | null;
}
