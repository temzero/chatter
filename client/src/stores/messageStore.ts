import { create } from "zustand";
import type {
  AttachmentResponse,
  MessageResponse,
} from "@/types/messageResponse";
import { useChatStore } from "./chatStore";
import { AttachmentType } from "@/types/enums/attachmentType";
import { messageService } from "@/services/messageService";
import { useMemo } from "react";
import { handleError } from "@/utils/handleError";
import { LastMessageResponse } from "@/types/messageResponse";
import { useShallow } from "zustand/shallow";
import { useChatMemberStore } from "./chatMemberStore";

interface ChatMessages {
  [chatId: string]: MessageResponse[];
}

export interface MessageStore {
  messages: ChatMessages;
  drafts: Record<string, string>;
  isLoading: boolean;

  fetchMessages: (chatId: string) => Promise<void>;
  addMessage: (newMessage: MessageResponse) => void;
  deleteMessage: (messageId: string) => void;
  getChatMessages: (chatId: string) => MessageResponse[];
  getChatAttachments: (chatId: string) => AttachmentResponse[];
  setDraftMessage: (chatId: string, draft: string) => void;
  getDraftMessage: (chatId: string) => string;
  setChatMessages: (chatId: string, messages: MessageResponse[]) => void;
  clearChatMessages: (chatId: string) => void;
  getUnreadMessagesCount: (chatId: string, memberId: string) => number;
  isMessageReadByMember: (
    message: MessageResponse,
    memberId: string
  ) => boolean;
}

export const getAttachmentsFromMessages = (
  messages: MessageResponse[]
): AttachmentResponse[] =>
  messages
    .filter((msg) => msg.attachments && msg.attachments.length > 0)
    .flatMap((msg) =>
      msg.attachments!.map((attachment) => ({
        ...attachment,
        messageId: msg.id,
      }))
    );

const createLastMessage = (message: MessageResponse): LastMessageResponse => {
  const {
    id,
    senderId,
    senderFirstName,
    senderNickname,
    content = "",
    attachments = [],
    createdAt,
  } = message;

  const senderName = senderNickname || senderFirstName;

  const attachmentTypes = attachments.length ? attachments[0].type : undefined;

  const icon = attachments.some((a) => a.type === AttachmentType.IMAGE)
    ? "image"
    : attachments.some((a) => a.type === AttachmentType.VIDEO)
    ? "videocam"
    : attachments.some((a) => a.type === AttachmentType.AUDIO)
    ? "music_note"
    : attachments.length
    ? "folder_zip"
    : undefined;

  return {
    id,
    senderId,
    senderName,
    content: content || "Attachment",
    attachmentTypes,
    createdAt,
    icon,
  };
};

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},
  drafts: {},
  isLoading: false,

  fetchMessages: async (chatId: string) => {
    set({ isLoading: true });
    try {
      const messages = await messageService.getChatMessages(chatId);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: messages,
        },
        isLoading: false,
      }));
    } catch (error) {
      handleError(error, "Fail fetching messages");
      set({ isLoading: false });
    }
  },

  addMessage: (newMessage) => {
    console.log("Adding new message:", newMessage);
    const { messages } = get();
    const chatId = newMessage.chatId;

    const updatedMessages = {
      ...messages,
      [chatId]: [...(messages[chatId] || []), newMessage],
    };

    const lastMessage = createLastMessage(newMessage);

    // Update last message in chat store
    useChatStore.getState().setLastMessage(chatId, lastMessage);

    set({
      messages: updatedMessages,
    });
  },

  deleteMessage: (messageId: string) => {
    const { messages } = get();

    // Find which chat contains this message
    const chatId = Object.keys(messages).find((chatId) =>
      messages[chatId].some((msg) => msg.id === messageId)
    );

    if (!chatId) return;

    set({
      messages: {
        ...messages,
        [chatId]: messages[chatId].filter((msg) => msg.id !== messageId),
      },
    });
  },

  getChatMessages: (chatId) => {
    return get().messages[chatId] || [];
  },

  getChatAttachments: (chatId) => {
    const chatMessages = get().messages[chatId] || [];
    return getAttachmentsFromMessages(chatMessages);
  },

  setDraftMessage: (chatId, draft) =>
    set((state) => ({
      drafts: { ...state.drafts, [chatId]: draft },
    })),

  getDraftMessage: (chatId) => {
    return get().drafts[chatId] || "";
  },

  setChatMessages: (chatId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    }));
  },

  clearChatMessages: (chatId) => {
    const { messages } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [chatId]: _, ...remainingMessages } = messages;

    set({
      messages: remainingMessages,
    });
  },

  getUnreadMessagesCount: (chatId, memberId) => {
    const messages = get().messages[chatId] || [];
    const member = useChatMemberStore
      .getState()
      .getChatMember(chatId, memberId);

    if (!member || !member.lastReadAt) return messages.length;

    return messages.filter(
      (message) =>
        member.lastReadAt !== null &&
        new Date(message.createdAt) > new Date(member.lastReadAt as string)
    ).length;
  },

  isMessageReadByMember: (message, memberId) => {
    const member = useChatMemberStore
      .getState()
      .getChatMember(message.chatId, memberId);
    return (
      !!member?.lastReadAt &&
      new Date(member.lastReadAt) >= new Date(message.createdAt)
    );
  },
}));



// Custom hooks for easier consumption in components
export const useActiveChatMessages = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const messages = useMessageStore((state) => state.messages);
  const isLoading = useMessageStore((state) => state.isLoading);

  return useMemo(() => {
    return activeChat && !isLoading ? messages[activeChat.id] || [] : [];
  }, [activeChat, isLoading, messages]);
};

export const useMessagesByChatId = (chatId: string) => {
  return useMessageStore(useShallow((state) => state.messages[chatId] || []));
};

export const useActiveChatAttachments = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const isLoading = useMessageStore((state) => state.isLoading);
  const getChatAttachments = useMessageStore(
    (state) => state.getChatAttachments
  );

  return useMemo(
    () => (activeChat && !isLoading ? getChatAttachments(activeChat.id) : []),
    [activeChat, isLoading, getChatAttachments]
  );
};

export const useActiveChatDraft = () => {
  const activeChatId = useChatStore((state) => state.activeChat?.id);
  return useMessageStore((state) =>
    activeChatId ? state.getDraftMessage(activeChatId) : ""
  );
};

export const useMessageLoading = () => {
  return useMessageStore((state) => state.isLoading);
};

export const useUnreadMessagesCount = (chatId: string, memberId: string) => {
  return useMessageStore((state) =>
    state.getUnreadMessagesCount(chatId, memberId)
  );
};

export const useIsMessageReadByMember = (
  message: MessageResponse,
  memberId: string
) => {
  return useMessageStore((state) =>
    state.isMessageReadByMember(message, memberId)
  );
};
