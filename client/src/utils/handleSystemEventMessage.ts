import { MessageResponse } from "@/types/responses/message.response";
import { useChatStore } from "@/stores/chatStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { SystemEventType } from "@/types/enums/systemEventType";
import { ChatMemberRole } from "@/types/enums/chatMemberRole";
import { ChatMemberStatus } from "@/types/enums/chatMemberStatus";
import { chatMemberService } from "@/services/chat/chatMemberService";

type SystemMessageJSONContent = {
  oldValue?: string;
  newValue?: string;
  targetId?: string;
  targetName?: string;
};

export const handleSystemEventMessage = (message: MessageResponse) => {
  if (!message.systemEvent) {
    console.log("not a system message");
    return;
  }

  const chatStore = useChatStore.getState();
  const memberStore = useChatMemberStore.getState();

  const { chatId, sender, systemEvent, content } = message;

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
      chatStore.updateGroupChatLocally?.(chatId, { name: updatedValue }),

    [SystemEventType.CHAT_UPDATE_DESCRIPTION]: () =>
      chatStore.updateGroupChatLocally?.(chatId, {
        description: updatedValue,
      }),

    [SystemEventType.CHAT_UPDATE_AVATAR]: () =>
      chatStore.updateGroupChatLocally?.(chatId, {
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
  };

  updateMap[systemEvent]?.();
};
