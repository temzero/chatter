import { CallStatus } from '../type/callStatus';

export class UpdateCallDto {
  isVideoCall?: boolean;
  status?: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  attendedUserIds?: string[];
  currentUserIds?: string[];
}
