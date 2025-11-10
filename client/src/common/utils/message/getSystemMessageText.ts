import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { parseJsonContent } from "@/common/utils/parseJsonContent";
import { SystemMessageJSONContent } from "@/components/ui/messages/content/SystemMessageContent";

type GetSystemMessageContentProps = {
  systemEvent?: SystemEventType | null;
  currentUserId: string;
  senderId: string;
  senderDisplayName: string;
  JSONcontent?: SystemMessageJSONContent | null;
};

export function getSystemMessageText({
  systemEvent,
  currentUserId,
  senderId,
  senderDisplayName,
  JSONcontent,
}: GetSystemMessageContentProps): string {
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
    default:
      return `System event occurred.`;
  }
}
