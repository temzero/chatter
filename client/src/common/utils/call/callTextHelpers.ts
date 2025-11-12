import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallError, CallStatus } from "@/shared/types/call";
import {
  formatDuration,
  formatDurationByStartAndEnd,
} from "../format/formatDuration";
import { TFunction } from "i18next";

export const getLocalCallStatusMessage = (
  t: TFunction,
  callStatus: LocalCallStatus | null,
  duration: number | null,
  error?: string | null
) => {
  switch (callStatus) {
    case LocalCallStatus.CANCELED:
      return t("call.summary.canceled");
    case LocalCallStatus.TIMEOUT:
      return t("call.summary.no_answer");
    case LocalCallStatus.DECLINED:
      return t("call.summary.declined");
    case LocalCallStatus.ENDED:
      return duration ? formatDuration(duration) : t("call.summary.ended");
    case LocalCallStatus.ERROR:
      if (error === CallError.LINE_BUSY)
        return t("call.summary.error.line_busy");
      if (error === CallError.PERMISSION_DENIED)
        return t("call.summary.error.permission_denied");
      if (error === CallError.DEVICE_UNAVAILABLE)
        return t("call.summary.error.device_unavailable");
      if (error === CallError.CONNECTION_FAILED)
        return t("call.summary.error.connection_failed");
      if (error === CallError.INITIATION_FAILED)
        return t("call.summary.error.initiation_failed");
      return t("call.summary.error.generic");
    default:
      return null;
  }
};

export const getCallStatusText = (
  t: TFunction,
  status: CallStatus,
  startedAt?: string | Date,
  endedAt?: string | Date | null
) => {
  switch (status) {
    case CallStatus.DIALING:
      return t("call.dialing");
    case CallStatus.IN_PROGRESS:
      return t("call.inProgress");
    case CallStatus.COMPLETED:
      if (startedAt && endedAt) {
        return formatDurationByStartAndEnd(t, startedAt, endedAt);
      }
      return t("call.completed");
    case CallStatus.MISSED:
      return t("call.missed");
    case CallStatus.FAILED:
      return t("call.failed");
    default:
      return t("call.call");
  }
};
