import { CallStatus } from "../enums/CallStatus";

export interface CallLiteResponse {
  id: string;
  status: CallStatus;
  isVideoCall: boolean;
  initiatorId: string;
  startedAt: Date;
  endedAt?: Date | null;
}
