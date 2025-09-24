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
  // if (!callStatus) return isMe ? "You had a call" : `${displayName} had a call`;
  if (!callStatus) return isMe ? "No CallStatus" : `${displayName} No CallStatus`;

  switch (callStatus) {
    case CallStatus.DIALING:
      return isMe ? "You are calling..." : `${displayName} is calling you...`;
    case CallStatus.IN_PROGRESS:
      return isMe ? "You are on a call" : `On a call with ${displayName}`;
    case CallStatus.COMPLETED:
      return isMe ? "You ended the call" : `${displayName} ended the call`;
    case CallStatus.MISSED:
      return isMe
        ? `Call you made to ${displayName} was missed`
        : `Missed call from ${displayName}`;
    case CallStatus.FAILED:
      return isMe
        ? `Your call to ${displayName} failed`
        : `Call with ${displayName} failed`;
    default:
      return isMe ? "You had a call" : `${displayName} had a call`;
  }
}
