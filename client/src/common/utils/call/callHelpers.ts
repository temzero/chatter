import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";

export const getCallStatusColor = (status: CallStatus) => {
  switch (status) {
    case CallStatus.DIALING:
    case CallStatus.IN_PROGRESS:
      return "text-green-500";
    case CallStatus.MISSED:
    case CallStatus.FAILED:
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
};

export const getCallStatusIcon = (
  callStatus: CallStatus | null,
  isBroadcast?: boolean
): string => {
  if (!callStatus) return "call";

  if (isBroadcast) {
    switch (callStatus) {
      case CallStatus.DIALING:
      case CallStatus.IN_PROGRESS:
      case CallStatus.COMPLETED:
        return "connected_tv";
      case CallStatus.MISSED:
      case CallStatus.FAILED:
        return "tv_off";
      default:
        return "connected_tv";
    }
  }

  switch (callStatus) {
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
