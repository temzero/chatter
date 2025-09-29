import { CallStatus } from "@/types/enums/CallStatus";

type GetCallMessageProps = {
  callStatus?: CallStatus | null;
  isMe: boolean;
  displayName: string;
};

export function getCallMessageContent({
  callStatus,
  isMe,
  displayName,
}: GetCallMessageProps): string {
  if (!callStatus) {
    console.warn("callStatus is missing", callStatus);
  }

  switch (callStatus) {
    case CallStatus.DIALING:
      return isMe ? "You are calling..." : `${displayName} is calling`;
    case CallStatus.IN_PROGRESS:
      return "In progress";
    case CallStatus.COMPLETED:
      return "Ended";
    case CallStatus.MISSED:
      return isMe ? `Missed` : `Missed call from ${displayName}`;
    case CallStatus.FAILED:
      return `Failed`;
    default:
      return "";
  }
}
