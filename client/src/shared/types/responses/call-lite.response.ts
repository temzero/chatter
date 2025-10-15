import { CallStatus } from "@/shared/types/enums/call-status.enum";

export interface CallLiteResponse {
  id: string;
  status: CallStatus;
  startedAt: Date;
  endedAt?: Date | null;
}
