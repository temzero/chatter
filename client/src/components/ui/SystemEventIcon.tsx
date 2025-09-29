import { CallStatus } from "@/types/enums/CallStatus";
import { SystemEventType } from "@/types/enums/systemEventType";

// Component that renders the icon, now accepting className prop
export const SystemEventIcon = ({
  systemEvent,
  callStatus,
  className = "",
}: {
  systemEvent: SystemEventType;
  callStatus?: CallStatus | null;
  className?: string;
}) => (
  <span className={`material-symbols-outlined text-sm ${className}`}>
    {getSystemEventIconName(systemEvent, callStatus)}
  </span>
);

// Function that returns the icon name string
const getSystemEventIconName = (
  systemEvent: SystemEventType,
  callStatus?: CallStatus | null
): string => {
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

    case SystemEventType.CALL:
      switch (callStatus) {
        case CallStatus.DIALING:
          return "call"; // maybe add "call_made" for outgoing
        case CallStatus.IN_PROGRESS:
          return "call"; // could use "call_end" with color/style
        case CallStatus.COMPLETED:
          return "call_end";
        case CallStatus.MISSED:
          return "phone_missed";
        case CallStatus.FAILED:
          return "e911_avatar";
        default:
          return "call";
      }
    default:
      return "info";
  }
};
