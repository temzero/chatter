import { CallStatus } from 'src/shared/types/call';

export interface UpdateCallData {
  isVideoCall?: boolean;
  status?: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  attendedUserIds?: string[];
  currentUserIds?: string[];
}
