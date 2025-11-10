import i18n from "@/i18n";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { parseJsonContent } from "../parseJsonContent";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { SystemMessageJSONContent } from "@/components/ui/messages/content/SystemMessageContent";

export function getSystemMessageColor(
  systemEvent?: SystemEventType | null
): string {
  if (!systemEvent) return "";

  switch (systemEvent) {
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

export function getSystemMessageText({
  systemEvent,
  currentUserId,
  senderId,
  senderDisplayName,
  JSONcontent,
}: {
  systemEvent?: SystemEventType | null;
  currentUserId: string;
  senderId: string;
  senderDisplayName: string;
  JSONcontent?: SystemMessageJSONContent | null;
}): string {
  const t = i18n.t;

  if (!systemEvent) return t("system.unknown_event");

  const isMe = currentUserId === senderId;
  const displayName = isMe ? t("common.you") : senderDisplayName;
  const parsedContent = parseJsonContent<SystemMessageJSONContent>(JSONcontent);

  const newVal = parsedContent?.newValue;
  const oldVal = parsedContent?.oldValue;
  const isTargetMe = parsedContent?.targetId === currentUserId;
  const targetName = isTargetMe
    ? t("common.you")
    : parsedContent?.targetName || t("system.another_member");

  switch (systemEvent) {
    case SystemEventType.MEMBER_JOINED:
      return t("system.member_joined", { displayName });
    case SystemEventType.MEMBER_ADDED:
      return t("system.member_added", { displayName, targetName });
    case SystemEventType.MEMBER_LEFT:
      return t("system.member_left", { displayName });
    case SystemEventType.MEMBER_KICKED:
      return t("system.member_kicked", { displayName, targetName });
    case SystemEventType.MEMBER_BANNED:
      return t("system.member_banned", { displayName, targetName });
    case SystemEventType.CHAT_RENAMED:
      return newVal
        ? t("system.chat_renamed_with_values", { displayName, oldVal, newVal })
        : t("system.chat_renamed", { displayName });
    case SystemEventType.CHAT_UPDATE_AVATAR:
      return t("system.chat_update_avatar", { displayName });
    case SystemEventType.CHAT_UPDATE_DESCRIPTION:
      if (oldVal && newVal)
        return t("system.chat_update_description_with_values", {
          displayName,
          oldVal,
          newVal,
        });
      if (newVal)
        return t("system.chat_set_description", { displayName, newVal });
      return t("system.chat_update_description", { displayName });
    case SystemEventType.MEMBER_UPDATE_NICKNAME:
      if (oldVal && newVal)
        return t("system.member_update_nickname_with_values", {
          displayName,
          targetName,
          oldVal,
          newVal,
        });
      if (newVal)
        return t("system.member_set_nickname", {
          displayName,
          targetName,
          newVal,
        });
      return t("system.member_update_nickname", { displayName, targetName });
    case SystemEventType.MEMBER_UPDATE_ROLE:
      if (newVal === ChatMemberRole.OWNER)
        return t("system.member_promote_owner", { displayName, targetName });
      return t("system.member_update_role", {
        displayName,
        targetName,
        newVal,
      });
    case SystemEventType.MEMBER_UPDATE_STATUS:
      return t("system.member_update_status", {
        displayName,
        targetName,
        newVal,
      });
    case SystemEventType.MESSAGE_PINNED:
      return t("system.message_pinned", { displayName, newVal });
    case SystemEventType.MESSAGE_UNPINNED:
      return t("system.message_unpinned", { displayName });
    case SystemEventType.CHAT_DELETED:
      return t("system.chat_deleted", { displayName });
    default:
      return t("system.unknown_event");
  }
}
