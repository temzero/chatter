// store/messageStore.ts
import { create } from "zustand";
import type {
  AttachmentResponse,
  MessageResponse,
  SenderResponse,
} from "@/types/responses/message.response";
import { useActiveChatId, useChatStore } from "./chatStore";
import { messageService } from "@/services/messageService";
import { useMemo } from "react";
import { handleError } from "@/utils/handleError";
import { useShallow } from "zustand/react/shallow";
import { useChatMemberStore } from "./chatMemberStore";
import { useAuthStore } from "./authStore";
import { createLastMessage } from "@/utils/createLastMessage";

interface ChatMessages {
  [chatId: string]: MessageResponse[];
}

export interface MessageStore {
  messages: ChatMessages;
  hasMoreMessages: Record<string, boolean>;
  drafts: Record<string, string>;
  isLoading: boolean;

  fetchMessages: (chatId: string) => Promise<void>;
  fetchMoreMessages: (chatId: string) => Promise<number>;
  addMessage: (newMessage: MessageResponse) => void;
  getMessageById: (messageId: string) => MessageResponse | undefined;
  updateMessageById: (
    chatId: string,
    messageId: string,
    updatedMessage: Partial<MessageResponse>
  ) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
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
  getUserReaction: (messageId: string, userId: string) => string | null;
  getReactionCount: (messageId: string, emoji: string) => number;
  updateMessageReactions: (
    messageId: string,
    newReactions: Record<string, string[]>
  ) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;
  removeReaction: (messageId: string, emoji: string, userId: string) => void;
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

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},
  hasMoreMessages: {},
  drafts: {},
  isLoading: false,

  fetchMessages: async (chatId: string) => {
    set({ isLoading: true });
    try {
      const { messages, hasMore } = await messageService.getChatMessages(
        chatId
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: messages,
        },
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [chatId]: hasMore,
        },
        isLoading: false,
      }));
    } catch (error) {
      handleError(error, "Fail fetching messages");
      set({ isLoading: false });
    }
  },

  fetchMoreMessages: async (chatId: string) => {
    set({ isLoading: true });
    try {
      const existingMessages = get().messages[chatId] || [];
      if (existingMessages.length === 0) {
        set({ isLoading: false });
        return 0;
      }

      const { messages: newMessages, hasMore } =
        await messageService.getChatMessages(chatId, {
          beforeMessageId: existingMessages[0].id,
        });

      if (newMessages.length > 0) {
        set((state) => {
          const existing = state.messages[chatId] || [];
          return {
            messages: {
              ...state.messages,
              [chatId]: [...newMessages, ...existing],
            },
            hasMoreMessages: {
              ...state.hasMoreMessages,
              [chatId]: hasMore,
            },
            isLoading: false,
          };
        });
      } else {
        // still update hasMoreMessages in case server returned 0 and hasMore = false
        set((state) => ({
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [chatId]: hasMore,
          },
          isLoading: false,
        }));
      }

      return newMessages.length;
    } catch (err) {
      handleError(err, "Failed to fetch more messages");
      set({ isLoading: false });
      return 0;
    }
  },

  addMessage: (newMessage) => {
    const { messages } = get();
    const chatId = newMessage.chatId;

    const updatedMessages = {
      ...messages,
      [chatId]: [...(messages[chatId] || []), newMessage],
    };

    const currentUser = useAuthStore.getState().currentUser;
    const currentUserId = currentUser ? currentUser.id : undefined;
    const isFromMe = newMessage.sender.id === currentUserId;
    const lastMessage = createLastMessage(newMessage);

    useChatStore.getState().setLastMessage(chatId, lastMessage);

    if (!isFromMe) {
      useChatStore.getState().setUnreadCount(chatId, +1);
    }

    set({ messages: updatedMessages });
  },

  getMessageById: (messageId) => {
    const messages = get().messages;
    for (const chatId in messages) {
      const found = messages[chatId].find((msg) => msg.id === messageId);
      if (found) return found;
    }
    return undefined;
  },

  updateMessageById: (chatId, messageId, updatedMessage) => {
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      const index = chatMessages.findIndex((msg) => msg.id === messageId);
      if (index === -1) return {}; // Message not found

      const updatedMessages = [...chatMessages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        ...updatedMessage,
      };

      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage?.id === messageId) {
        const newLast = createLastMessage(updatedMessages[index]);
        useChatStore.getState().setLastMessage(chatId, newLast);
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: updatedMessages,
        },
      };
    });
  },

  deleteMessage: (chatId, messageId) => {
    const { messages } = get();
    if (!chatId) return;

    const chatMessages = messages[chatId] || [];
    const messageToDelete = chatMessages.find((msg) => msg.id === messageId);

    set({
      messages: {
        ...messages,
        [chatId]: chatMessages.filter((msg) => msg.id !== messageId),
      },
    });

    if (
      messageToDelete &&
      chatMessages.length > 0 &&
      chatMessages[chatMessages.length - 1].id === messageId
    ) {
      const updatedMessages = messages[chatId].filter(
        (msg) => msg.id !== messageId
      );

      if (updatedMessages.length > 0) {
        const newLastMessage = updatedMessages[updatedMessages.length - 1];
        const lastMessage = createLastMessage(newLastMessage);
        useChatStore.getState().setLastMessage(chatId, lastMessage);
      } else {
        useChatStore.getState().setLastMessage(chatId, null);
      }
    }
  },

  getChatMessages: (chatId) => get().messages[chatId] || [],

  getChatAttachments: (chatId) => {
    const chatMessages = get().messages[chatId] || [];
    return getAttachmentsFromMessages(chatMessages);
  },

  setDraftMessage: (chatId, draft) =>
    set((state) => ({
      drafts: { ...state.drafts, [chatId]: draft },
    })),

  getDraftMessage: (chatId) => get().drafts[chatId] || "",

  setChatMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    })),

  clearChatMessages: (chatId) => {
    const { messages } = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [chatId]: _, ...remainingMessages } = messages;
    set({ messages: remainingMessages });
  },

  getUnreadMessagesCount: (chatId, memberId) => {
    const messages = get().messages[chatId] || [];
    const member = useChatMemberStore
      .getState()
      .getChatMember(chatId, memberId);

    if (!member || !member.lastReadMessageId) return messages.length;

    const lastReadIndex = messages.findIndex(
      (msg) => msg.id === member.lastReadMessageId
    );

    return lastReadIndex === -1
      ? messages.length
      : messages.length - (lastReadIndex + 1);
  },

  isMessageReadByMember: (message, memberId) => {
    const member = useChatMemberStore
      .getState()
      .getChatMember(message.chatId, memberId);
    if (!member?.lastReadMessageId) return false;

    const messages = get().messages[message.chatId] || [];
    const targetIndex = messages.findIndex((msg) => msg.id === message.id);
    const readIndex = messages.findIndex(
      (msg) => msg.id === member.lastReadMessageId
    );

    return readIndex >= targetIndex && targetIndex !== -1;
  },

  getUserReaction: (messageId, userId) => {
    const messages = get().messages;
    for (const chatId in messages) {
      const message = messages[chatId].find((msg) => msg.id === messageId);
      if (message?.reactions) {
        for (const [emoji, userIds] of Object.entries(message.reactions)) {
          if (userIds.includes(userId)) return emoji;
        }
      }
    }
    return null;
  },

  getReactionCount: (messageId, emoji) => {
    const messages = get().messages;
    for (const chatId in messages) {
      const message = messages[chatId].find((msg) => msg.id === messageId);
      if (message?.reactions?.[emoji]) {
        return message.reactions[emoji].length;
      }
    }
    return 0;
  },

  updateMessageReactions: (messageId, newReactions) => {
    set((state) => {
      const updatedMessages = { ...state.messages };
      for (const chatId in updatedMessages) {
        const index = updatedMessages[chatId].findIndex(
          (msg) => msg.id === messageId
        );
        if (index !== -1) {
          updatedMessages[chatId][index] = {
            ...updatedMessages[chatId][index],
            reactions: newReactions,
          };
          break;
        }
      }
      return { messages: updatedMessages };
    });
  },

  addReaction: (messageId, emoji, userId) => {
    set((state) => {
      const updatedMessages = { ...state.messages };
      for (const chatId in updatedMessages) {
        const index = updatedMessages[chatId].findIndex(
          (msg) => msg.id === messageId
        );
        if (index !== -1) {
          const msg = updatedMessages[chatId][index];
          const reactions = msg.reactions || {};
          const users = reactions[emoji] || [];

          if (!users.includes(userId)) {
            updatedMessages[chatId][index] = {
              ...msg,
              reactions: {
                ...reactions,
                [emoji]: [...users, userId],
              },
            };
          }
          break;
        }
      }
      return { messages: updatedMessages };
    });
  },

  removeReaction: (messageId, emoji, userId) => {
    set((state) => {
      const updatedMessages = { ...state.messages };
      for (const chatId in updatedMessages) {
        const index = updatedMessages[chatId].findIndex(
          (msg) => msg.id === messageId
        );
        if (index !== -1) {
          const msg = updatedMessages[chatId][index];
          const reactions = msg.reactions || {};
          const filtered = (reactions[emoji] || []).filter(
            (id) => id !== userId
          );

          const newReactions = { ...reactions };
          if (filtered.length > 0) {
            newReactions[emoji] = filtered;
          } else {
            delete newReactions[emoji];
          }

          updatedMessages[chatId][index] = {
            ...msg,
            reactions:
              Object.keys(newReactions).length > 0 ? newReactions : undefined,
          };
          break;
        }
      }
      return { messages: updatedMessages };
    });
  },
}));

// Hooks remain unchanged
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

export const useSenderByMessageId = (
  messageId: string
): SenderResponse | undefined => {
  return useMessageStore((state) => {
    const message = state.getMessageById(messageId);
    return message?.sender;
  });
};

export const useActiveChatAttachments = () => {
  const activeChatId = useActiveChatId();
  const isLoading = useMessageStore((state) => state.isLoading);
  const getChatAttachments = useMessageStore(
    (state) => state.getChatAttachments
  );

  return useMemo(
    () => (activeChatId && !isLoading ? getChatAttachments(activeChatId) : []),
    [activeChatId, isLoading, getChatAttachments]
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

export const useMessageReactions = (messageId: string) =>
  useMessageStore(
    useShallow((state) => {
      const messages = state.messages;
      for (const chatId in messages) {
        const message = messages[chatId].find((msg) => msg.id === messageId);
        if (message) {
          return message.reactions || {};
        }
      }
      return {};
    })
  );

export const useHasMoreMessages = (chatId: string) => {
  return useMessageStore((state) => state.hasMoreMessages[chatId] ?? true);
};
