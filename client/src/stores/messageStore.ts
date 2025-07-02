// store/messageStore.ts
import { create } from "zustand";
import type {
  AttachmentResponse,
  MessageResponse,
} from "@/types/responses/message.response";
import { useChatStore } from "./chatStore";
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
  drafts: Record<string, string>;
  isLoading: boolean;
  replyToMessage: MessageResponse | null;

  fetchMessages: (chatId: string) => Promise<void>;
  addMessage: (newMessage: MessageResponse) => void;
  getMessageById: (messageId: string) => MessageResponse | undefined;
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

  setReplyToMessage: (message: MessageResponse | null) => void;
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

// const createLastMessage = (message: MessageResponse): LastMessageResponse => {
//   const {
//     id,
//     sender,
//     content = "",
//     attachments = [],
//     forwardedFromMessage,
//     createdAt,
//   } = message;

//   // Use forwarded message if exists
//   const isForwarded = !!forwardedFromMessage;

//   const actualContent = isForwarded
//     ? forwardedFromMessage.content || "Attachment"
//     : content || "Attachment";

//   const actualAttachments = isForwarded
//     ? forwardedFromMessage.attachments || []
//     : attachments;

//   const attachmentTypes = actualAttachments.length
//     ? actualAttachments[0].type
//     : undefined;

//   const icon = actualAttachments.some((a) => a.type === AttachmentType.IMAGE)
//     ? "image"
//     : actualAttachments.some((a) => a.type === AttachmentType.VIDEO)
//     ? "videocam"
//     : actualAttachments.some((a) => a.type === AttachmentType.AUDIO)
//     ? "music_note"
//     : actualAttachments.length
//     ? "folder_zip"
//     : undefined;

//   return {
//     id,
//     senderId: sender.id,
//     senderDisplayName: sender.displayName,
//     content: actualContent,
//     icons,
//     isForwarded,
//     createdAt,
//   };
// };

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},
  drafts: {},
  isLoading: false,
  replyToMessage: null,

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

    // const currentUserId = useCurrentUserId();
    const currentUser = useAuthStore.getState().currentUser;
    const currentUserId = currentUser ? currentUser.id : undefined;
    const isFromMe = newMessage.sender.id === currentUserId;

    const lastMessage = createLastMessage(newMessage);

    // Update last message in chat store
    useChatStore.getState().setLastMessage(chatId, lastMessage);

    // Update unread count if not from me and chat is not active
    if (!isFromMe) {
      useChatStore.getState().setUnreadCount(chatId, +1);
    }

    set({
      messages: updatedMessages,
    });
  },

  getMessageById: (messageId: string): MessageResponse | undefined => {
    const messages = get().messages;
    for (const chatId in messages) {
      const found = messages[chatId].find((msg) => msg.id === messageId);
      if (found) return found;
    }
    return undefined;
  },

  deleteMessage: (chatId: string, messageId: string) => {
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

    // Check if the deleted message was the last message
    if (
      messageToDelete &&
      chatMessages.length > 0 &&
      chatMessages[chatMessages.length - 1].id === messageId
    ) {
      const updatedMessages = messages[chatId].filter(
        (msg) => msg.id !== messageId
      );

      if (updatedMessages.length > 0) {
        // There are still messages left - set the new last message
        const newLastMessage = updatedMessages[updatedMessages.length - 1];
        const lastMessage = createLastMessage(newLastMessage);
        useChatStore.getState().setLastMessage(chatId, lastMessage);
      } else {
        // No messages left - set last message to null
        useChatStore.getState().setLastMessage(chatId, null);
      }
    }
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

    if (!member || !member.lastReadMessageId) return messages.length;

    const messagesInChat = messages;
    const lastReadIndex = messagesInChat.findIndex(
      (msg) => msg.id === member.lastReadMessageId
    );

    if (lastReadIndex === -1) return messagesInChat.length;

    return messagesInChat.length - (lastReadIndex + 1);
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
          if (userIds.includes(userId)) {
            return emoji;
          }
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
        const messageIndex = updatedMessages[chatId].findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          const updatedMessage = {
            ...updatedMessages[chatId][messageIndex],
            reactions: newReactions,
          };

          updatedMessages[chatId][messageIndex] = updatedMessage;
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
        const messageIndex = updatedMessages[chatId].findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          const message = updatedMessages[chatId][messageIndex];
          const currentReactions = message.reactions || {};
          const currentUserIds = currentReactions[emoji] || [];

          if (!currentUserIds.includes(userId)) {
            updatedMessages[chatId][messageIndex] = {
              ...message,
              reactions: {
                ...currentReactions,
                [emoji]: [...currentUserIds, userId],
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
        const messageIndex = updatedMessages[chatId].findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          const message = updatedMessages[chatId][messageIndex];
          const currentReactions = message.reactions || {};
          const currentUserIds = currentReactions[emoji] || [];

          if (currentUserIds.includes(userId)) {
            const filteredUserIds = currentUserIds.filter(
              (id) => id !== userId
            );
            // Build updatedReactions without any undefined values
            const updatedReactions: Record<string, string[]> = {};
            Object.entries({
              ...currentReactions,
              [emoji]: filteredUserIds,
            }).forEach(([key, value]) => {
              if (value && value.length > 0) {
                updatedReactions[key] = value;
              }
            });

            updatedMessages[chatId][messageIndex] = {
              ...message,
              reactions:
                Object.keys(updatedReactions).length > 0
                  ? updatedReactions
                  : undefined,
            };
          }
          break;
        }
      }

      return { messages: updatedMessages };
    });
  },

  setReplyToMessage: (message) => set({ replyToMessage: message }),
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

export const useMessageReactions = (messageId: string) => {
  return useMessageStore((state) => {
    const messages = state.messages;
    for (const chatId in messages) {
      const message = messages[chatId].find((msg) => msg.id === messageId);
      if (message) {
        return message.reactions || {};
      }
    }
    return {};
  });
};
