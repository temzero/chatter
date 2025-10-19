import { MessageResponse } from "@/shared/types/responses/message.response";
import { useChatStore } from "@/stores/chatStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { ChatMemberStatus } from "@/shared/types/enums/chat-member-status.enum";
import { chatMemberService } from "@/services/chatMemberService";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";

type SystemMessageJSONContent = {
  oldValue?: string;
  newValue?: string;
  targetId?: string;
  targetName?: string;
};

export const handleSystemEventMessage = (message: MessageResponse) => {
  if (!message.systemEvent) {
    return;
  }

  const chatStore = useChatStore.getState();
  const memberStore = useChatMemberStore.getState();

  const { chatId, sender, systemEvent, content } = message;
  const typedSystemEvent = systemEvent as SystemEventType;

  let updatedValue: string | null | undefined;
  let targetId: string | undefined;

  try {
    const parsed: SystemMessageJSONContent | null = content
      ? JSON.parse(content)
      : null;
    updatedValue = parsed?.newValue ?? content;
    targetId = parsed?.targetId;
  } catch {
    updatedValue = content ?? "";
  }

  const updateMap: Partial<Record<SystemEventType, () => void>> = {
    [SystemEventType.CHAT_RENAMED]: () =>
      chatStore.updateChatLocally?.(chatId, { name: updatedValue }),

    [SystemEventType.CHAT_UPDATE_DESCRIPTION]: () =>
      chatStore.updateChatLocally?.(chatId, {
        description: updatedValue,
      }),

    [SystemEventType.CHAT_UPDATE_AVATAR]: () =>
      chatStore.updateChatLocally?.(chatId, {
        avatarUrl: updatedValue,
      }),

    [SystemEventType.MEMBER_UPDATE_NICKNAME]: () =>
      sender?.id &&
      memberStore.updateMemberLocally?.(chatId, sender.id, {
        nickname: updatedValue,
      }),

    [SystemEventType.MEMBER_UPDATE_ROLE]: () =>
      sender?.id &&
      memberStore.updateMemberLocally?.(chatId, sender.id, {
        role: updatedValue as ChatMemberRole,
      }),

    [SystemEventType.MEMBER_UPDATE_STATUS]: () =>
      sender?.id &&
      memberStore.updateMemberLocally?.(chatId, sender.id, {
        status: updatedValue as ChatMemberStatus,
      }),

    [SystemEventType.MEMBER_ADDED]: async () => {
      if (!targetId) return;
      try {
        const newMember = await chatMemberService.fetchMemberByChatIdAndUserId(
          chatId,
          targetId
        );
        memberStore.addMemberLocally?.(newMember);
      } catch (error) {
        console.error("Failed to fetch new member:", error);
      }
    },
    [SystemEventType.MEMBER_JOINED]: async () => {
      if (!sender?.id) return;
      try {
        const newMember = await chatMemberService.fetchMemberByChatIdAndUserId(
          chatId,
          sender.id
        );
        memberStore.addMemberLocally?.(newMember);
      } catch (error) {
        console.error("Failed to fetch new member:", error);
      }
    },

    [SystemEventType.MEMBER_LEFT]: () => {
      if (sender?.id) {
        memberStore.clearChatMember?.(chatId, sender.id);
      }
    },

    [SystemEventType.MEMBER_KICKED]: () => {
      if (targetId) {
        memberStore.clearChatMember?.(chatId, targetId);
      }
    },

    [SystemEventType.MEMBER_BANNED]: () => {
      if (targetId) {
        memberStore.updateMemberLocally?.(chatId, targetId, {
          status: ChatMemberStatus.BANNED,
        });
      }
    },
    [SystemEventType.CALL]: () => {
      if (targetId) {
        memberStore.updateMemberLocally?.(chatId, targetId, {
          status: ChatMemberStatus.BANNED,
        });
      }
    },
  };
  updateMap[typedSystemEvent]?.();
};
