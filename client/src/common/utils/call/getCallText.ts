import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { formatDurationByStartAndEnd } from "../format/formatDuration";
import i18n from "@/i18n";

export const getCallText = (
  status: CallStatus,
  startedAt?: string | Date,
  endedAt?: string | Date | null
) => {
  const t = i18n.t;

  switch (status) {
    case CallStatus.DIALING:
      return t("call.dialing");
    case CallStatus.IN_PROGRESS:
      return t("call.inProgress");
    case CallStatus.COMPLETED:
      if (startedAt && endedAt) {
        return formatDurationByStartAndEnd(startedAt, endedAt);
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
