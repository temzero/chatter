import { CallActionResponse, IncomingCallResponse } from "@/types/callPayload";
import { CallStatus, PendingCallStatus } from "@/types/enums/CallStatus";

// 🔹 Format duration from ms → "Xs", "1m12s", "1h20m"
export const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h${minutes}m`;
  if (minutes > 0) return `${minutes}m${seconds}s`;
  return `${seconds}s`;
};

export const getCallText = (
  call: CallActionResponse | IncomingCallResponse
) => {
  switch (call.status) {
    case PendingCallStatus.DIALING:
      return "Calling...";
    case PendingCallStatus.IN_PROGRESS:
      return "Call in progress";
    case CallStatus.COMPLETED: {
      if (call.startedAt && call.endedAt) {
        const duration =
          new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime();
        return `Call ended • ${formatDuration(duration)}`;
      }
      return "Call ended";
    }
    case CallStatus.DECLINED:
      return "Call was declined";
    case CallStatus.MISSED:
      return "Call was missed";
    case CallStatus.FAILED:
      return "Call failed";
    default:
      return "Call";
  }
};

export const getCallClass = (
  call: CallActionResponse | IncomingCallResponse
) => {
  switch (call.status) {
    case CallStatus.COMPLETED:
      return "text-yellow-600";
    case CallStatus.DECLINED:
    case CallStatus.MISSED:
    case CallStatus.FAILED:
      return "text-red-600";
    default:
      return "";
  }
};

export const getCallIcon = (
  call: CallActionResponse | IncomingCallResponse
) => {
  switch (call.status) {
    case PendingCallStatus.DIALING:
      return "ring_volume";
    case PendingCallStatus.IN_PROGRESS:
      return "phone_in_talk";
    case CallStatus.COMPLETED:
      return "call_end";
    case CallStatus.DECLINED:
      return "phone_disabled";
    case CallStatus.MISSED:
      return "phone_missed";
    case CallStatus.FAILED:
      return "e911_avatar";
    default:
      return "call";
  }
};
