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

interface ChatMessages {
  [chatId: string]: MessageResponse[];
}

export interface MessageStore {
  messages: ChatMessages;
  drafts: Record<string, string>;
  isLoading: boolean;

  fetchMessages: (chatId: string) => void;
  addMessage: (newMessage: MessageResponse) => void;
  deleteMessage: (messageId: string) => void;
  getChatMessages: (chatId: string) => MessageResponse[];
  getChatAttachments: (chatId: string) => AttachmentResponse[];
  setDraftMessage: (chatId: string, draft: string) => void;
  getDraftMessage: (chatId: string) => string;
  setChatMessages: (chatId: string, messages: MessageResponse[]) => void;
  clearChatMessages: (chatId: string) => void;
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

const createLastMessageInfo = (message: MessageResponse) => {
  const { content = "", attachments = [], createdAt } = message;
  const types = attachments.map((a) => a.type);
  const icon = types.includes(AttachmentType.IMAGE)
    ? "image"
    : types.includes(AttachmentType.VIDEO)
    ? "videocam"
    : types.includes(AttachmentType.AUDIO)
    ? "music_note"
    : types.length
    ? "folder_zip"
    : undefined;

  const contentText = content || "Attachment";
  return { content: contentText, icon, time: createdAt };
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
      // console.log("all fetched messages: ", get().messages);
      return messages;
    } catch (error) {
      handleError(error, "Fail fetching messages");
      set({ isLoading: false });
    }
  },

  addMessage: (newMessage) => {
    console.log("[STORE] 🧠 Adding message to store:", newMessage);
    const { messages } = get();
    const chatId = newMessage.chatId

    const updatedMessages = {
      ...messages,
      [chatId]: [...(messages[chatId] || []), newMessage],
    };

    // Update last message info in chat store
    const chats = useChatStore.getState().chats.map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            ...createLastMessageInfo(newMessage),
          }
        : chat
    );

    useChatStore.setState({ chats });

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
}));

// // Custom hooks for easier consumption in components
export const useActiveChatMessages = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const isLoading = useMessageStore((state) => state.isLoading);
  const getChatMessages = useMessageStore((state) => state.getChatMessages);

  return useMemo(
    () => (activeChat && !isLoading ? getChatMessages(activeChat.id) : []),
    [activeChat, isLoading, getChatMessages]
  );
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
