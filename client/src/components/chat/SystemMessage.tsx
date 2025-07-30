import { useCurrentUserId } from "@/stores/authStore";
import { SystemEventType } from "@/types/enums/systemEventType";

type Props = {
  isSidebar?: boolean;
  systemEvent?: SystemEventType | null;
  senderId: string;
  senderDisplayName: string;
  content?: string | null;
};

const SystemMessage = ({
  isSidebar,
  systemEvent,
  senderId,
  senderDisplayName,
  content,
}: Props) => {
  const currentUserId = useCurrentUserId();
  const isMe = currentUserId === senderId;
  const displayName = isMe ? "You" : senderDisplayName;

  const getSystemMessageContent = () => {
    switch (systemEvent) {
      case SystemEventType.MEMBER_JOINED:
        return `${displayName} joined the chat`;
      case SystemEventType.MEMBER_LEFT:
        return `${displayName} left the chat`;
      case SystemEventType.MEMBER_KICKED:
        return `${displayName} was removed from the chat`;
      case SystemEventType.MEMBER_BANNED:
        return `${displayName} was banned from the chat`;
      case SystemEventType.CHAT_RENAMED:
        return `${displayName} renamed chat to "${content}"`;
      case SystemEventType.CHAT_UPDATE_AVATAR:
        return `${displayName} updated chat avatar`;
      case SystemEventType.CHAT_UPDATE_DESCRIPTION:
        return `${displayName} updated description "${content}"`;
      case SystemEventType.MEMBER_UPDATE_NICKNAME:
        return `${displayName} changed nickname to "${content}"`;
      case SystemEventType.MEMBER_UPDATE_ROLE:
        return `${displayName} changed role to "${content}"`;
      case SystemEventType.MEMBER_UPDATE_STATUS:
        return `${displayName} changed status to "${content}"`;
      default:
        return `System event occurred.`;
    }
  };

  const getClass = () => {
    const classes = [];
    if (isSidebar) {
      classes.push("text-xs", "max-w-[196px]");
    }
    switch (systemEvent) {
      case SystemEventType.MEMBER_LEFT:
      case SystemEventType.MEMBER_KICKED:
      case SystemEventType.MEMBER_BANNED:
        classes.push("text-red-400");
        break;
    }
    return classes.join(" ");
  };

  const getIconName = () => {
    switch (systemEvent) {
      case SystemEventType.MEMBER_JOINED:
        return "login";
      case SystemEventType.MEMBER_LEFT:
        return "logout";
      case SystemEventType.MEMBER_KICKED:
        return "sports_gymnastics";
      case SystemEventType.MEMBER_BANNED:
        return "block";
      case SystemEventType.CHAT_RENAMED:
        return "edit";
      // case SystemEventType.CHAT_UPDATE_AVATAR:
      //   return "image";
      case SystemEventType.CHAT_UPDATE_DESCRIPTION:
        return "notes";
      case SystemEventType.MEMBER_UPDATE_NICKNAME:
        return "badge";
      case SystemEventType.MEMBER_UPDATE_ROLE:
        return "supervisor_account";
      case SystemEventType.MEMBER_UPDATE_STATUS:
        return "sync_alt";
      default:
        return null;
    }
  };

  return (
    <p
      className={`flex items-center gap-1 opacity-60 italic truncate text-center ${getClass()}`}
    >
      {getIconName() && (
        <span className="material-symbols-outlined">{getIconName()}</span>
      )}
      {getSystemMessageContent()}
      {systemEvent === SystemEventType.CHAT_UPDATE_AVATAR &&
        content &&
        !isSidebar && (
          <img
            src={content}
            alt="Chat Avatar"
            className="w-10 h-10 custom-border rounded-lg ml-1"
          />
        )}
    </p>
  );
};

export default SystemMessage;
