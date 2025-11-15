// store/messageStore.ts
import { useMemo } from "react";
import { create } from "zustand";
import { useChatStore } from "./chatStore";
import { messageService } from "@/services/http/messageService";
import { useChatMemberStore } from "./chatMemberStore";
import { getCurrentUserId, useAuthStore } from "./authStore";
import { handleError } from "@/common/utils/error/handleError";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import {
  MessageResponse,
  SenderResponse,
} from "@/shared/types/responses/message.response";
import { useAttachmentStore } from "./messageAttachmentStore";
import { audioService, SoundType } from "@/services/audio.service";
import { useShallow } from "zustand/shallow";

// Normalized structure
type MessagesById = Record<string, MessageResponse>; // messageId -> Message
type MessageIdsByChat = Record<string, string[]>; // chatId -> [messageId]

type HasMoreMessages = Record<string, boolean>; // chatId -> boolean
type Drafts = Record<string, string>; // chatId -> draft

interface MessageStoreState {
  messagesById: MessagesById;
  messageIdsByChat: MessageIdsByChat;
  hasMoreMessages: HasMoreMessages;
  drafts: Drafts;
  searchQuery: string;
  showImportantOnly: boolean;
  isSearchMessages: boolean;
  isLoading: boolean;
}

interface MessageStoreActions {
  setInitialData: (
    chatId: string,
    messages: MessageResponse[],
    hasMore: boolean
  ) => void;
  fetchMessages: (chatId: string) => Promise<void>;
  fetchMoreMessages: (chatId: string) => Promise<number>;
  addMessage: (newMessage: MessageResponse) => void;
  getMessageById: (messageId: string) => MessageResponse | undefined;
  updateMessageById: (
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
  getUnreadMessagesCount: (
    chatId: string,
    memberId: string
  ) => number | Promise<number>;
  isMessageReadByMember: (
    message: MessageResponse,
    memberId: string
  ) => boolean | Promise<boolean>;
  getUserReaction: (messageId: string, userId: string) => string | null;
  getReactionCount: (messageId: string, emoji: string) => number;
  updateMessageReactions: (
    messageId: string,
    newReactions: Record<string, string[]>
  ) => void;
  setShowImportantOnly: (value: boolean) => void;
  addReaction: (messageId: string, emoji: string, userId: string) => void;
  removeReaction: (messageId: string, emoji: string, userId: string) => void;
  setDisplaySearchMessage: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;

  clearMessageStore: () => void;
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

const initialState: MessageStoreState = {
  messagesById: {},
  messageIdsByChat: {},
  hasMoreMessages: {},
  drafts: {},
  searchQuery: "",
  showImportantOnly: false,
  isSearchMessages: false,
  isLoading: false,
};

export const useMessageStore = create<MessageStoreState & MessageStoreActions>(
  (set, get) => ({
    ...initialState,

    // ---------- CORE ACTIONS ----------
    setInitialData: (chatId, messages, hasMore) => {
      const messagesById = { ...get().messagesById };
      const messageIds = messages.map((m) => {
        // Store message WITHOUT attachments
        const { attachments, ...messageWithoutAttachments } = m;
        messagesById[m.id] = messageWithoutAttachments as MessageResponse;
        // Save attachments to attachment store
        if (attachments && attachments.length > 0) {
          useAttachmentStore
            .getState()
            .addMessageAttachments(m.chatId, m.id, attachments);
        }

        return m.id;
      });

      set({
        messagesById,
        messageIdsByChat: { ...get().messageIdsByChat, [chatId]: messageIds },
        hasMoreMessages: { ...get().hasMoreMessages, [chatId]: hasMore },
      });
    },

    addMessage: (newMessage) => {
      console.log("Adding message:", newMessage);
      const { messagesById, messageIdsByChat } = get();
      const chatId = newMessage.chatId;

      // Extract attachments before storing message
      const { attachments, ...messageWithoutAttachments } = newMessage;

      const messageWithAnimation = {
        ...messageWithoutAttachments,
        shouldAnimate: true,
      } as MessageResponse;

      const currentIds = messageIdsByChat[chatId] || [];
      set({
        messagesById: {
          ...messagesById,
          [newMessage.id]: messageWithAnimation,
        },
        messageIdsByChat: {
          ...messageIdsByChat,
          [chatId]: [...currentIds, newMessage.id],
        },
      });

      // Save attachments to attachment store
      if (attachments && attachments.length > 0) {
        useAttachmentStore
          .getState()
          .addMessageAttachments(newMessage.chatId, newMessage.id, attachments);
      }

      const currentUserId = getCurrentUserId();
      if (newMessage.sender.id !== currentUserId) {
        useChatStore.getState().setUnreadCount(chatId, +1);
      }
    },

    fetchMessages: async (chatId) => {
      set({ isLoading: true });
      try {
        const { items: messages, hasMore } =
          await messageService.fetchChatMessages(chatId);
        get().setInitialData(chatId, messages, hasMore);
        set({ isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        handleError(error, "Fail fetching messages");
      }
    },

    fetchMoreMessages: async (chatId) => {
      set({ isLoading: true });
      const existingIds = get().messageIdsByChat[chatId] || [];
      if (existingIds.length === 0) return 0;

      const lastMessageId = existingIds[0];
      const { items: newMessages, hasMore } =
        await messageService.fetchChatMessages(chatId, {
          lastId: lastMessageId,
        });

      if (newMessages.length > 0) {
        const messagesById = { ...get().messagesById };
        newMessages.forEach((msg) => {
          // Extract attachments before storing
          const { attachments, ...messageWithoutAttachments } = msg;
          messagesById[msg.id] = messageWithoutAttachments as MessageResponse;

          // Save attachments to attachment store
          if (attachments && attachments.length > 0) {
            useAttachmentStore
              .getState()
              .addMessageAttachments(msg.chatId, msg.id, attachments);
          }
        });

        set({
          messagesById,
          messageIdsByChat: {
            ...get().messageIdsByChat,
            [chatId]: [...newMessages.map((m) => m.id), ...existingIds],
          },
          hasMoreMessages: { ...get().hasMoreMessages, [chatId]: hasMore },
          isLoading: false,
        });
      } else {
        set({
          hasMoreMessages: { ...get().hasMoreMessages, [chatId]: hasMore },
          isLoading: false,
        });
      }
      return newMessages.length;
    },

    getMessageById: (messageId) => get().messagesById[messageId],

    updateMessageById: (messageId, updatedMessage) => {
      console.log("updateMessageById:", messageId, updatedMessage);
      set((state) => ({
        messagesById: {
          ...state.messagesById,
          [messageId]: { ...state.messagesById[messageId], ...updatedMessage },
        },
      }));
    },

    deleteMessage: (chatId, messageId) => {
      const { messageIdsByChat } = get();

      // 1️⃣ Immediately remove ID from messageIdsByChat → triggers exit animation
      const newIds = (messageIdsByChat[chatId] || []).filter(
        (id) => id !== messageId
      );
      set({
        messageIdsByChat: { ...messageIdsByChat, [chatId]: newIds },
      });

      // 2️⃣ Wait 3 seconds before removing from messagesById (cleanup)
      setTimeout(() => {
        const latestState = get();
        const newMessagesById = { ...latestState.messagesById };
        delete newMessagesById[messageId];

        set({
          messagesById: newMessagesById,
        });

        // Also remove from attachment store
        useAttachmentStore.getState().removeMessageAttachments(messageId);
      }, 1000);

      // 3️⃣ Play sound immediately
      audioService.playSound(SoundType.MESSAGE_REMOVE);
    },

    getChatMessages: (chatId) => {
      const ids = get().messageIdsByChat[chatId] || [];
      const messagesById = get().messagesById;
      return ids.map((id) => messagesById[id]);
    },

    getChatAttachments: (chatId) =>
      getAttachmentsFromMessages(get().getChatMessages(chatId)),

    setDraftMessage: (chatId, draft) =>
      set({ drafts: { ...get().drafts, [chatId]: draft } }),

    getDraftMessage: (chatId) => get().drafts[chatId] || "",

    setChatMessages: (chatId, messages) => {
      const messagesById = { ...get().messagesById };
      const messageIds = messages.map((m) => {
        // Extract attachments before storing
        const { attachments, ...messageWithoutAttachments } = m;
        messagesById[m.id] = messageWithoutAttachments as MessageResponse;

        // Save attachments to attachment store
        if (attachments && attachments.length > 0) {
          useAttachmentStore
            .getState()
            .addMessageAttachments(m.chatId, m.id, attachments);
        }

        return m.id;
      });

      set({
        messagesById,
        messageIdsByChat: { ...get().messageIdsByChat, [chatId]: messageIds },
      });
    },

    clearChatMessages: (chatId) => {
      const { messagesById, messageIdsByChat } = get();
      const idsToRemove = messageIdsByChat[chatId] || [];
      const newMessagesById = { ...messagesById };
      idsToRemove.forEach((id) => delete newMessagesById[id]);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [chatId]: _, ...newIdsByChat } = messageIdsByChat;
      set({ messagesById: newMessagesById, messageIdsByChat: newIdsByChat });
    },

    getUnreadMessagesCount: async (chatId, memberId) => {
      const messages = get().getChatMessages(chatId);
      const member = await useChatMemberStore
        .getState()
        .getChatMemberById(memberId);
      if (!member) return messages.length;
      const lastReadIndex = messages.findIndex(
        (msg) => msg.id === member.lastReadMessageId
      );
      return lastReadIndex === -1
        ? messages.length
        : messages.length - (lastReadIndex + 1);
    },

    isMessageReadByMember: async (message, memberId) => {
      const member = await useChatMemberStore
        .getState()
        .getChatMemberById(memberId);
      if (!member) return false;
      const messages = get().getChatMessages(message.chatId);
      const targetIndex = messages.findIndex((msg) => msg.id === message.id);
      const readIndex = messages.findIndex(
        (msg) => msg.id === member.lastReadMessageId
      );
      return readIndex >= targetIndex && targetIndex !== -1;
    },

    getUserReaction: (messageId, userId) => {
      const msg = get().messagesById[messageId];
      if (!msg?.reactions) return null;
      for (const [emoji, userIds] of Object.entries(msg.reactions)) {
        if (userIds.includes(userId)) return emoji;
      }
      return null;
    },

    getReactionCount: (messageId, emoji) => {
      const msg = get().messagesById[messageId];
      return msg?.reactions?.[emoji]?.length || 0;
    },

    updateMessageReactions: (messageId, newReactions) => {
      set((state) => ({
        messagesById: {
          ...state.messagesById,
          [messageId]: {
            ...state.messagesById[messageId],
            reactions: newReactions,
          },
        },
      }));
    },

    addReaction: (messageId, emoji, userId) => {
      const msg = get().messagesById[messageId];
      if (!msg) return;
      const reactions = msg.reactions || {};
      const users = reactions[emoji] || [];
      if (!users.includes(userId)) {
        const newReactions = { ...reactions, [emoji]: [...users, userId] };
        get().updateMessageReactions(messageId, newReactions);
      }
    },

    removeReaction: (messageId, emoji, userId) => {
      const msg = get().messagesById[messageId];
      if (!msg || !msg.reactions?.[emoji]) return;
      const filtered = msg.reactions[emoji].filter((id) => id !== userId);
      const newReactions = { ...msg.reactions };
      if (filtered.length > 0) newReactions[emoji] = filtered;
      else delete newReactions[emoji];
      get().updateMessageReactions(messageId, newReactions);
    },

    setShowImportantOnly: (value) => set({ showImportantOnly: value }),
    setDisplaySearchMessage: (isOpen) => set({ isSearchMessages: isOpen }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    clearMessageStore: () => set({ ...initialState }),
  })
);

// ---------- HOOKS ----------

export const useMessageIds = (chatId: string): string[] => {
  return useMessageStore(
    useShallow((state) => state.messageIdsByChat[chatId] || [])
  );
};

export const useMessagesByChatId = (chatId: string) => {
  const messageIds = useMessageStore(
    (state) => state.messageIdsByChat[chatId] || []
  );
  const messagesById = useMessageStore((state) => state.messagesById);
  const searchQuery = useMessageStore((state) => state.searchQuery);
  const showImportantOnly = useMessageStore((state) => state.showImportantOnly);
  const currentUserId = useAuthStore.getState().currentUser?.id;

  return useMemo(() => {
    const members = useChatMemberStore.getState().chatMembers[chatId] || [];
    const blockedUserIds = new Set(
      members
        .filter((m) => m.userId !== currentUserId && m.isBlockedByMe)
        .map((m) => m.userId)
    );
    return messageIds
      .map((id) => messagesById[id])
      .filter((msg) => msg && !blockedUserIds.has(msg.sender.id))
      .filter(
        (msg) =>
          !searchQuery ||
          msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((msg) => !showImportantOnly || msg.isImportant);
  }, [
    chatId,
    messageIds,
    currentUserId,
    messagesById,
    searchQuery,
    showImportantOnly,
  ]);
};

export const useSenderByMessageId = (
  messageId: string
): SenderResponse | undefined =>
  useMessageStore((state) => state.messagesById[messageId]?.sender);

export const useMessageReactions = (messageId: string) =>
  useMessageStore((state) => state.messagesById[messageId]?.reactions || {});

export const useHasMoreMessages = (chatId: string) =>
  useMessageStore((state) => state.hasMoreMessages[chatId] ?? true);

export const useLastMessage = (chatId: string) =>
  useMessageStore((state) => {
    const ids = state.messageIdsByChat[chatId] || [];
    return ids.length ? state.messagesById[ids[ids.length - 1]] : null;
  });

export const useDraftMessage = (chatId?: string): string => {
  return useMessageStore(
    useShallow((state) => (chatId ? state.drafts[chatId] || "" : ""))
  );
};
