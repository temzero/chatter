import { CallStatus } from "@/shared/types/enums/call-status.enum";

export interface CallLiteResponse {
  id: string;
  status: CallStatus;
  isVideoCall: boolean;
  initiatorId: string;
  startedAt: Date;
  endedAt?: Date | null;
}
