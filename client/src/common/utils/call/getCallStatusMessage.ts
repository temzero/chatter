import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallError } from "@/shared/types/call";
import { formatDuration } from "../format/formatDuration";
import i18n from "@/i18n";

export const getCallStatusMessage = (
  callStatus: LocalCallStatus | null,
  duration: number | null,
  error?: string | null
) => {
  const t = i18n.t;

  switch (callStatus) {
    case LocalCallStatus.CANCELED:
      return "Call canceled";
    case LocalCallStatus.TIMEOUT:
      return "No one answered"; // more user-friendly
    case LocalCallStatus.DECLINED:
      return "Call declined";
    case LocalCallStatus.ENDED:
      return duration ? formatDuration(duration) : "Call ended";
    case LocalCallStatus.ERROR:
      if (error === CallError.LINE_BUSY) return "Line is busy";
      if (error === CallError.PERMISSION_DENIED) return "Permission denied";
      if (error === CallError.DEVICE_UNAVAILABLE) return "Device unavailable";
      if (error === CallError.CONNECTION_FAILED) return "Connection failed";
      if (error === CallError.INITIATION_FAILED)
        return "Call initiation failed";
      return "Something went wrong!";
    default:
      return null;
  }
};
