import { CallStatus } from '../type/callStatus';

export class UpdateCallDto {
  isVideoCall?: boolean;
  isGroupCall?: boolean;
  status?: CallStatus;
  endedAt?: Date;
  duration?: number;
}
