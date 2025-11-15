import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { parseJsonContent } from "../parseJsonContent";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { SystemMessageJSONContent } from "@/components/ui/messages/content/SystemMessageContent";
import { TFunction } from "i18next";

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

    // case SystemEventType.CHAT_RENAMED:
    // case SystemEventType.CHAT_UPDATE_AVATAR:
    // case SystemEventType.CHAT_UPDATE_DESCRIPTION:
    //   return "text-blue-400";

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
  t,
  systemEvent,
  currentUserId,
  senderId,
  senderDisplayName,
  JSONcontent,
}: {
  t: TFunction;
  systemEvent?: SystemEventType | null;
  currentUserId: string;
  senderId: string;
  senderDisplayName: string;
  JSONcontent?: SystemMessageJSONContent | null;
}): string {
  if (!systemEvent) return t("system_message.default");

  const isMe = currentUserId === senderId;
  const displayName = isMe ? t("common.you") : senderDisplayName;
  const parsedContent = parseJsonContent<SystemMessageJSONContent>(JSONcontent);

  const newVal = parsedContent?.newValue;
  const oldVal = parsedContent?.oldValue;
  const isTargetMe = parsedContent?.targetId === currentUserId;
  const targetName = isTargetMe
    ? t("common.you")
    : parsedContent?.targetName || t("system_message.another_member");

  switch (systemEvent) {
    case SystemEventType.MEMBER_JOINED:
      return t("system_message.member_joined", { displayName });
    case SystemEventType.MEMBER_LEFT:
      return t("system_message.member_left", { displayName });
    case SystemEventType.MEMBER_KICKED:
      return t("system_message.member_kicked", { displayName, targetName });
    case SystemEventType.MEMBER_BANNED:
      return t("system_message.member_banned", { displayName, targetName });
    // case SystemEventType.CHAT_RENAMED:
    //   if (newVal) {
    //     return t("system_message.chat_renamed", {
    //       displayName,
    //       oldVal,
    //       newVal,
    //     });
    //   }
    //   return t("system_message.chat_renamed_no_values", { displayName });
    case SystemEventType.CHAT_RENAMED:
      if (oldVal && newVal) {
        return t("system_message.chat_renamed", {
          displayName,
          oldVal,
          newVal,
        });
      }
      if (newVal) {
        return t("system_message.chat_renamed_no_old", {
          displayName,
          newVal,
        });
      }
      return t("system_message.chat_renamed_no_values", { displayName });
    case SystemEventType.CHAT_UPDATE_AVATAR:
      return t("system_message.chat_updated_avatar", { displayName });
    case SystemEventType.CHAT_UPDATE_DESCRIPTION:
      if (oldVal && newVal) {
        return t("system_message.chat_updated_description_from_to", {
          displayName,
          oldVal,
          newVal,
        });
      }
      if (newVal) {
        return t("system_message.chat_set_description", {
          displayName,
          newVal,
        });
      }
      return t("system_message.chat_updated_description", { displayName });
    case SystemEventType.MEMBER_UPDATE_NICKNAME:
      if (oldVal && newVal) {
        return t("system_message.nickname_changed_from_to", {
          displayName,
          target: isTargetMe ? t("common.your") : targetName,
          oldVal,
          newVal,
        });
      }
      if (newVal) {
        return t("system_message.nickname_set", {
          displayName,
          target: isTargetMe ? t("common.your") : targetName,
          newVal,
        });
      }
      return t("system_message.nickname_updated", {
        displayName,
        target: isTargetMe ? t("common.your") : targetName,
      });
    case SystemEventType.MEMBER_UPDATE_ROLE:
      if (newVal === ChatMemberRole.OWNER) {
        return t("system_message.promoted_to_owner", {
          displayName,
          target: isTargetMe ? t("common.you") : targetName,
        });
      }
      return newVal
        ? t("system_message.role_changed_to", {
            displayName,
            target: isTargetMe ? t("common.your") : targetName,
            newVal,
          })
        : t("system_message.role_updated", {
            displayName,
            target: isTargetMe ? t("common.your") : targetName,
          });
    case SystemEventType.MEMBER_UPDATE_STATUS:
      return newVal
        ? t("system_message.status_changed_to", {
            displayName,
            target: isTargetMe ? t("common.your") : targetName,
            newVal,
          })
        : t("system_message.status_updated", {
            displayName,
            target: isTargetMe ? t("common.your") : targetName,
          });
    case SystemEventType.MESSAGE_PINNED:
      return newVal
        ? t("system_message.message_pinned_with_content", {
            displayName,
            newVal,
          })
        : t("system_message.message_pinned", { displayName });
    case SystemEventType.MESSAGE_UNPINNED:
      return t("system_message.message_unpinned", { displayName });
    case SystemEventType.CHAT_DELETED:
      return t("system_message.chat_deleted", { displayName });
    default:
      return t("system_message.default");
  }
}
