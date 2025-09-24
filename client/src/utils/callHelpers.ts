import { CallStatus } from "@/types/enums/CallStatus";
import { formatDurationByStartAndEnd } from "./formatDuration";

export const getCallText = (
  status: CallStatus,
  startedAt?: string | Date,
  endedAt?: string | Date | null,
) => {
  switch (status) {
    case CallStatus.DIALING:
      return "Calling...";
    case CallStatus.IN_PROGRESS:
      return "Call in progress";
    case CallStatus.COMPLETED:
      if (startedAt && endedAt) {
        return `Call ended • ${formatDurationByStartAndEnd(
          startedAt,
          endedAt
        )}`;
      }
      return "Call ended";
    case CallStatus.MISSED:
      return "Call was missed";
    case CallStatus.FAILED:
      return "Call failed";
    default:
      return "Call";
  }
};

export const getCallClass = (status: CallStatus) => {
  switch (status) {
    case CallStatus.COMPLETED:
      return "text-yellow-600";
    case CallStatus.MISSED:
    case CallStatus.FAILED:
      return "text-red-600";
    default:
      return "";
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
