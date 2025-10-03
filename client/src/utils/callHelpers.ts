import { CallStatus, LocalCallStatus } from "@/types/enums/CallStatus";
import { formatDurationByStartAndEnd } from "./formatDuration";

export const getCallText = (
  status: CallStatus,
  startedAt?: string | Date,
  endedAt?: string | Date | null
) => {
  switch (status) {
    case CallStatus.DIALING:
      return "Calling...";
    case CallStatus.IN_PROGRESS:
      return "In progress";
    case CallStatus.COMPLETED:
      if (startedAt && endedAt) {
        return `${formatDurationByStartAndEnd(startedAt, endedAt)}`;
      }
      return "Completed";
    case CallStatus.MISSED:
      return "Missed";
    case CallStatus.FAILED:
      return "Failed";
    default:
      return "Call";
  }
};

export const getCallColor = (status: CallStatus) => {
  switch (status) {
    case CallStatus.MISSED:
    case CallStatus.FAILED:
      return "text-red-600";
    default:
      return "opacity-80";
  }
};

export const getCallIcon = (status: CallStatus) => {
  switch (status) {
    case CallStatus.DIALING:
      return "ring_volume";
    case CallStatus.IN_PROGRESS:
      return "phone_in_talk";
    case CallStatus.COMPLETED:
      return "call_end";
    case CallStatus.MISSED:
      return "phone_missed";
    case CallStatus.FAILED:
      return "e911_avatar";
    default:
      return "call";
  }
};

// ========== HELPERS ==========
export function getLocalCallStatus(
  callStatus: CallStatus
): LocalCallStatus | undefined {
  switch (callStatus) {
    case CallStatus.IN_PROGRESS:
      return LocalCallStatus.CONNECTED;
    case CallStatus.DIALING:
      return LocalCallStatus.INCOMING;
    case CallStatus.COMPLETED:
    case CallStatus.MISSED:
    case CallStatus.FAILED:
      return LocalCallStatus.ENDED;
    default:
      return undefined;
  }
}
