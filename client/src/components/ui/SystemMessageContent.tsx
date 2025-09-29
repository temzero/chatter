import { SystemEventType } from "@/types/enums/systemEventType";
import { SystemEventIcon } from "./SystemEventIcon";
import { JSX } from "react";
import { parseJsonContent } from "@/utils/parseJsonContent";
import { ChatMemberRole } from "@/types/enums/chatMemberRole";
import { CallStatus } from "@/types/enums/CallStatus";
import { getCallMessageContent } from "./SystemCallMessageContent";

export type SystemMessageJSONContent = {
  oldValue?: string;
  newValue?: string;
  targetId?: string;
  targetName?: string;
};

type SystemMessageContentProps = {
  systemEvent?: SystemEventType | null;
  callStatus?: CallStatus | null;
  isBroadcast?: boolean;
  currentUserId: string;
  senderId: string;
  senderDisplayName: string;
  JSONcontent?: SystemMessageJSONContent | null;
  ClassName?: string;
};

export const SystemMessageContent = ({
  systemEvent,
  callStatus,
  isBroadcast = false,
  currentUserId,
  senderId,
  senderDisplayName,
  JSONcontent,
  ClassName = "",
}: SystemMessageContentProps): JSX.Element | null => {
  if (!systemEvent) return null;
  const text = getSystemMessageText({
    systemEvent,
    callStatus,
    currentUserId,
    senderId,
    senderDisplayName,
    JSONcontent,
  });

  return (
    <div
      className={`flex gap-1 items-center text-muted-foreground text-sm  ${getSystemMessageColor(
        systemEvent,
        callStatus
      )} ${ClassName}`}
    >
      {isBroadcast ? (
        <span className="material-symbols-outlined text-[20px]">connected_tv</span>
      ) : (
        <SystemEventIcon systemEvent={systemEvent} callStatus={callStatus} />
      )}

      <span className="truncate">{text}</span>
    </div>
  );
};

function getSystemMessageColor(
  systemEvent?: SystemEventType | null,
  callStatus?: CallStatus | null
): string {
  if (!systemEvent) return "";

  switch (systemEvent) {
    case SystemEventType.CALL:
      if (!callStatus) return "";
      switch (callStatus) {
        // case CallStatus.COMPLETED:
        //   return "text-yellow-500";
        case CallStatus.FAILED:
        case CallStatus.MISSED:
          return "text-red-500";
        case CallStatus.DIALING:
        case CallStatus.IN_PROGRESS:
          return "text-green-500";
        default:
          return "text-muted-foreground";
      }

    case SystemEventType.MEMBER_JOINED:
    case SystemEventType.MEMBER_ADDED:
      return "text-green-500";

    case SystemEventType.MEMBER_LEFT:
    case SystemEventType.MEMBER_KICKED:
    case SystemEventType.MEMBER_BANNED:
      return "text-red-500";

    case SystemEventType.CHAT_RENAMED:
      return "text-blue-500";

    case SystemEventType.CHAT_DELETED:
      return "text-red-600 font-semibold";

    case SystemEventType.MESSAGE_PINNED:
    case SystemEventType.MESSAGE_UNPINNED:
      return "text-purple-500";

    default:
      return "text-muted-foreground";
  }
}

function getSystemMessageText({
  systemEvent,
  callStatus,
  currentUserId,
  senderId,
  senderDisplayName,
  JSONcontent,
}: {
  systemEvent?: SystemEventType | null;
  callStatus?: CallStatus | null;
  currentUserId: string;
  senderId: string;
  senderDisplayName: string;
  JSONcontent?: SystemMessageJSONContent | null;
}): string {
  if (!systemEvent) return "System event occurred.";

  const isMe = currentUserId === senderId;
  const displayName = isMe ? "You" : senderDisplayName;
  const parsedContent = parseJsonContent<SystemMessageJSONContent>(JSONcontent);

  const newVal = parsedContent?.newValue;
  const oldVal = parsedContent?.oldValue;
  const isTargetMe = parsedContent?.targetId === currentUserId;
  const targetName = isTargetMe
    ? "you"
    : parsedContent?.targetName || "another member";

  switch (systemEvent) {
    case SystemEventType.MEMBER_JOINED:
      return `${displayName} joined the chat`;
    case SystemEventType.MEMBER_ADDED:
      return `${displayName} added ${targetName} to the chat`;
    case SystemEventType.MEMBER_LEFT:
      return `${displayName} left the chat`;
    case SystemEventType.MEMBER_KICKED:
      return `${displayName} removed ${targetName} from the chat`;
    case SystemEventType.MEMBER_BANNED:
      return `${displayName} banned ${targetName} from the chat`;
    case SystemEventType.CHAT_RENAMED:
      if (newVal) {
        return `${displayName} renamed chat ${
          oldVal ? `from "${oldVal}" ` : ""
        }to "${newVal}"`;
      }
      return `${displayName} renamed the chat`;
    case SystemEventType.CHAT_UPDATE_AVATAR:
      return `${displayName} updated the chat avatar`;
    case SystemEventType.CHAT_UPDATE_DESCRIPTION:
      if (oldVal && newVal) {
        return `${displayName} changed description from "${oldVal}" to "${newVal}"`;
      }
      if (newVal) {
        return `${displayName} set description to "${newVal}"`;
      }
      return `${displayName} updated the chat description`;
    case SystemEventType.MEMBER_UPDATE_NICKNAME:
      if (oldVal && newVal) {
        return `${displayName} changed ${
          isTargetMe ? "your" : `${targetName}'s`
        } nickname from "${oldVal}" to "${newVal}"`;
      }
      if (newVal) {
        return `${displayName} set ${
          isTargetMe ? "your" : `${targetName}'s`
        } nickname to "${newVal}"`;
      }
      return `${displayName} updated ${
        isTargetMe ? "your" : `${targetName}'s`
      } nickname`;
    case SystemEventType.MEMBER_UPDATE_ROLE:
      if (newVal === ChatMemberRole.OWNER) {
        return `${displayName} promoted ${
          isTargetMe ? "you" : targetName
        } to owner`;
      }
      return newVal
        ? `${displayName} changed ${
            isTargetMe ? "your" : `${targetName}'s`
          } role to ${newVal}`
        : `${displayName} updated ${
            isTargetMe ? "your" : `${targetName}'s`
          } role`;
    case SystemEventType.MEMBER_UPDATE_STATUS:
      return newVal
        ? `${displayName} changed ${
            isTargetMe ? "your" : `${targetName}'s`
          } status to ${newVal}`
        : `${displayName} updated ${
            isTargetMe ? "your" : `${targetName}'s`
          } status`;
    case SystemEventType.MESSAGE_PINNED:
      return newVal
        ? `${displayName} pinned a message "${newVal}"`
        : `${displayName} pinned a message`;
    case SystemEventType.MESSAGE_UNPINNED:
      return `${displayName} unpinned a message`;
    case SystemEventType.CHAT_DELETED:
      return `${displayName} deleted the chat`;

    case SystemEventType.CALL:
      return getCallMessageContent({
        callStatus,
        isMe,
        displayName,
      });

    default:
      return `System event occurred.`;
  }
}
