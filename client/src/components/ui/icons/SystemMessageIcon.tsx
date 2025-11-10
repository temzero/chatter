import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";

// Component that renders the icon, now accepting className prop
export const SystemMessageIcon = ({
  systemEvent,
  className = "",
}: {
  systemEvent: SystemEventType;
  className?: string;
}) => (
  <span className={`material-symbols-outlined text-sm ${className}`}>
    {getSystemEventIconName(systemEvent)}
  </span>
);

// Function that returns the icon name string
const getSystemEventIconName = (systemEvent: SystemEventType): string => {
  switch (systemEvent) {
    case SystemEventType.MEMBER_JOINED:
    case SystemEventType.MEMBER_ADDED:
      return "person_add";
    case SystemEventType.MEMBER_LEFT:
      return "person_remove";
    case SystemEventType.MEMBER_KICKED:
      return "person_off";
    case SystemEventType.MEMBER_BANNED:
      return "block";
    case SystemEventType.CHAT_RENAMED:
      return "edit";
    case SystemEventType.CHAT_UPDATE_AVATAR:
      return "image";
    case SystemEventType.CHAT_UPDATE_DESCRIPTION:
      return "notes";
    case SystemEventType.MEMBER_UPDATE_NICKNAME:
      return "badge";
    case SystemEventType.MEMBER_UPDATE_ROLE:
      return "supervisor_account";
    case SystemEventType.MEMBER_UPDATE_STATUS:
      return "sync_alt";
    case SystemEventType.MESSAGE_PINNED:
      return "push_pin";
    case SystemEventType.MESSAGE_UNPINNED:
      return "unpin";
    case SystemEventType.CHAT_DELETED:
      return "delete";
    default:
      return "info";
  }
};
