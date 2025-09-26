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
      return isMe ? "You are on a call" : `On a call with ${displayName}`;
    case CallStatus.COMPLETED:
      return "Call ended";
    case CallStatus.MISSED:
      return isMe ? `Call missed` : `Missed call from ${displayName}`;
    case CallStatus.FAILED:
      return `Call failed`;
    default:
      return "";
  }
}
