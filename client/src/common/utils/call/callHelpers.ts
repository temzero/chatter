import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { formatDurationByStartAndEnd } from "../format/formatDuration";
import { TFunction } from "i18next";

export const getCallText = (
  status: CallStatus,
  startedAt?: string | Date,
  endedAt?: string | Date | null,
  t?: TFunction
) => {
  switch (status) {
    case CallStatus.DIALING:
      return "Calling...";
    case CallStatus.IN_PROGRESS:
      return "In progress";
    case CallStatus.COMPLETED:
      if (startedAt && endedAt) {
        return `${formatDurationByStartAndEnd(startedAt, endedAt, t)}`;
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
