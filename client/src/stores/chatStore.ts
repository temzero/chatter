import { create } from "zustand";
// import { persist } from "zustand/middleware";
import { chatService } from "@/services/http/chatService";
import { chatMemberService } from "@/services/http/chatMemberService";
import { useMessageStore } from "./messageStore";
import { useAuthStore } from "./authStore";
import { useChatMemberStore } from "./chatMemberStore";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { toast } from "react-toastify";
import { useModalStore } from "./modalStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import { UpdateChatRequest } from "@/shared/types/requests/update-chat.request";
import { handleError } from "@/common/utils/handleError";
import {
  ChatResponse,
  ChatDataResponse,
  ChatMemberLite,
} from "@/shared/types/responses/chat.response";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { useShallow } from "zustand/shallow";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";

interface ChatStoreState {
  activeChatId: string | null;
  chats: Record<string, ChatResponse>;
  chatIds: string[];
  savedChat: ChatResponse | null;
  hasMoreChats: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ChatStoreActions {
  setInitialData: (data: PaginationResponse<ChatDataResponse>) => void;
  getChatById: (id?: string) => ChatResponse | undefined;
  getActiveChat: () => ChatResponse | null;
  getOrFetchChatById: (
    id: string,
    options?: { fetchFullData?: boolean }
  ) => Promise<ChatResponse>;
  getChatType: (chatId: string) => ChatType | undefined;
  fetchMoreChats: (limit?: number) => Promise<number>;
  fetchChatById: (
    chatId?: string,
    options?: { fetchFullData?: boolean }
  ) => Promise<ChatResponse>;
  getDirectChatByUserId: (userId: string) => Promise<ChatResponse | void>;

  setActiveChatId: (chatId: string | null) => Promise<void>;
  fetchChatData: (chatId: string) => Promise<void>;
  getAllUserIdsInChats: () => string[];
  createOrGetDirectChat: (partnerId: string) => Promise<ChatResponse>;
  createGroupChat: (payload: {
    name: string;
    userIds: string[];
    type: ChatType.GROUP | ChatType.CHANNEL;
  }) => Promise<ChatResponse>;
  updateChat: (payload: UpdateChatRequest) => Promise<void>;
  updateChatLocally: (id: string, payload: Partial<ChatResponse>) => void;
  pinChat: (myMemberId: string, isPinned: boolean) => Promise<void>;
  addMembersToChat: (chatId: string, userIds: string[]) => Promise<void>;
  setMute: (chatId: string, memberId: string, mutedUntil: Date | null) => void;
  setUnreadCount: (chatId: string, incrementBy: number) => void;
  setPinnedMessage: (chatId: string, message: MessageResponse | null) => void;
  generateInviteLink: (chatId: string) => Promise<string>;
  refreshInviteLink: (chatId: string, token: string) => Promise<string>;
  leaveChat: (chatId: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  cleanupChat: (chatId: string) => void;
  clearChats: () => void;

  addToGroupPreviewMembers: (chatId: string, member: ChatMemberLite) => void;
  removeFromGroupPreviewMembers: (chatId: string, userId: string) => void;
}

const initialState: ChatStoreState = {
  activeChatId: null,
  chats: {},
  chatIds: [],
  savedChat: null,
  hasMoreChats: true,
  isLoading: false,
  error: null,
};

export const useChatStore = create<ChatStoreState & ChatStoreActions>()(
  // persist(
  (set, get) => ({
    ...initialState,

    setInitialData: (data: PaginationResponse<ChatDataResponse>) => {
      const chatsMap: Record<string, ChatResponse> = {};
      const chatIds: string[] = [];
      let savedChat: ChatResponse | null = null;

      data.items.forEach((chat) => {
        const { messageData, memberData, ...chatData } = chat;

        // --- Messages ---
        const messages = messageData?.items || [];
        const hasMoreMessages = messageData?.hasMore ?? false;
        if (messages.length) {
          useMessageStore
            .getState()
            .setInitialData(chat.id, messages, hasMoreMessages);
        }

        // --- Chat Members ---
        const members = memberData?.items || [];
        const hasMoreMembers = memberData?.hasMore ?? false;
        if (members.length) {
          useChatMemberStore
            .getState()
            .setInitialData(chat.id, members, hasMoreMembers);
        }

        // --- Process chats (without messageData/memberData) ---
        if (chatData.type === ChatType.SAVED) {
          savedChat = chatData;
        } else {
          chatsMap[chatData.id] = chatData;
          chatIds.push(chatData.id);
        }
      });

      // --- Update chat store ---
      set({
        savedChat,
        chats: chatsMap,
        chatIds,
        hasMoreChats: data.hasMore,
      });
    },

    getChatById: (chatId?: string) => {
      if (!chatId) return undefined;
      return get().chats[chatId];
    },

    getActiveChat: () => {
      const { activeChatId, chats } = get();
      if (!activeChatId) return null;
      return chats[activeChatId] || null;
    },

    getOrFetchChatById: async (
      chatId: string,
      options = { fetchFullData: false }
    ) => {
      const { getChatById, fetchChatById } = get();

      // 1. Try get from store
      const existingChat = getChatById(chatId);
      if (existingChat) {
        return existingChat;
      }

      // 2. Otherwise, fetch from server
      const fetchedChat = await fetchChatById(chatId, options);
      return fetchedChat;
    },

    getChatType: (chatId) => {
      const chat = get().getChatById(chatId);
      return chat?.type;
    },

    fetchMoreChats: async (limit): Promise<number> => {
      console.log("fetchMore Chat", limit);
      const { chats, chatIds, hasMoreChats, isLoading } = get();
      if (isLoading || !hasMoreChats) return 0;

      const lastChatId = chatIds[chatIds.length - 1];
      if (!lastChatId) return 0;

      set({ isLoading: true });

      const { items: newChats, hasMore } = await chatService.fetchMoreChats({
        offset: chatIds.length,
        limit,
        lastId: lastChatId,
      });

      if (newChats.length > 0) {
        const filteredNewChats = newChats.filter(
          (chat) => chat.type !== ChatType.SAVED
        );

        const newChatsMap: Record<string, ChatResponse> = {};
        const newChatIds: string[] = [];

        filteredNewChats.forEach((chat) => {
          newChatsMap[chat.id] = chat;
          newChatIds.push(chat.id);
        });

        set({
          chats: { ...chats, ...newChatsMap },
          chatIds: [...chatIds, ...newChatIds],
          hasMoreChats: hasMore,
          isLoading: false,
        });

        return filteredNewChats.length;
      } else {
        set({ hasMoreChats: hasMore, isLoading: false });
        return 0;
      }
    },

    fetchChatById: async (chatId, options = { fetchFullData: false }) => {
      const targetChatId = chatId || get().activeChatId;
      if (!targetChatId) {
        throw new Error("No chat ID provided and no active chat");
      }

      set({ isLoading: true });
      try {
        const chat = await chatService.fetchChatById(targetChatId);

        // Update chat in state
        set((state) => {
          const chatExists = !!state.chats[targetChatId];
          return {
            chats: {
              ...state.chats,
              [targetChatId]: chat,
            },
            chatIds: chatExists ? state.chatIds : [chat.id, ...state.chatIds],
          };
        });

        // Optionally fetch full data
        if (options.fetchFullData) {
          await Promise.all([
            useChatMemberStore.getState().fetchChatMembers(targetChatId),
            useMessageStore.getState().fetchMessages(targetChatId),
          ]);
        }

        return chat;
      } catch (error) {
        set({ activeChatId: null });
        window.history.pushState({}, "", "/");
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    getDirectChatByUserId: async (userId) => {
      const { chats, chatIds } = get();
      const existingChat = chatIds.find((chatId) => {
        const chat = chats[chatId];
        return (
          chat?.type === ChatType.DIRECT &&
          chat.otherMemberUserIds?.includes(userId)
        );
      });

      if (existingChat) {
        await get().fetchChatById(existingChat);
        return chats[existingChat];
      }
      return;
    },

    setActiveChatId: async (chatId) => {
      // console.log("setActiveChatId", chatId);
      useSidebarInfoStore.getState().setSidebarInfo(SidebarInfoMode.DEFAULT);
      useMessageStore.getState().setDisplaySearchMessage(false);
      useModalStore.getState().closeModal();

      if (!chatId) {
        set({ activeChatId: null });
        return;
      }
      set({ activeChatId: chatId });
      get().updateChatLocally(chatId, { unreadCount: 0 });
      window.history.pushState({}, "", `/${chatId}`);
    },

    fetchChatData: async (chatId: string) => {
      set({ isLoading: true });
      const alreadyFetchedMessages = !!useMessageStore
        .getState()
        .getChatMessages(chatId);
      const alreadyFetchedMembers =
        !!useChatMemberStore.getState().chatMembers[chatId];

      const fetchMessagesPromise = alreadyFetchedMessages
        ? null
        : useMessageStore.getState().fetchMessages(chatId);

      const chat = get().getChatById(chatId);
      const fetchMembersPromise =
        alreadyFetchedMembers || !chat
          ? null
          : useChatMemberStore.getState().fetchChatMembers(chatId);

      await Promise.all(
        [fetchMessagesPromise, fetchMembersPromise].filter(Boolean)
      );
      set({ isLoading: false });
    },

    getAllUserIdsInChats: () => {
      const { chats, chatIds } = get();
      const allUserIds = new Set<string>();

      chatIds.forEach((chatId) => {
        const chat = chats[chatId];
        chat?.otherMemberUserIds?.forEach((userId) => allUserIds.add(userId));
      });

      return Array.from(allUserIds);
    },

    createOrGetDirectChat: async (partnerId) => {
      set({ isLoading: true });
      try {
        const { payload, wasExisting } =
          await chatService.createOrGetDirectChat(partnerId);

        if (!wasExisting) {
          set((state) => ({
            chats: { [payload.id]: payload, ...state.chats },
            chatIds: [payload.id, ...state.chatIds],
          }));
        }

        await get().setActiveChatId(payload.id);
        return payload;
      } catch (error) {
        set({ error: "Failed to create chat" });
        handleError(error, "Failed to create/get direct chat:");
      } finally {
        set({ isLoading: false });
      }
    },

    createGroupChat: async (payload) => {
      set({ isLoading: true });
      try {
        const newChat = await chatService.createGroupChat(payload);
        set((state) => ({
          chats: { [newChat.id]: newChat, ...state.chats },
          chatIds: [newChat.id, ...state.chatIds],
        }));
        return newChat;
      } catch (error) {
        console.error("Failed to create group chat:", error);
        set({ error: "Failed to create chat" });
        handleError(error, "Failed to create group chat");
      } finally {
        set({ isLoading: false });
      }
    },

    updateChat: async (payload: UpdateChatRequest) => {
      set({ isLoading: true });
      try {
        const updatedChat = await chatService.updateChat(payload);
        get().updateChatLocally(payload.chatId, updatedChat);
      } catch (error) {
        set({ error: "Failed to update chat" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateChatLocally: (chatId, payload) => {
      set((state) => {
        const chat = state.chats[chatId];
        if (!chat) return state;

        const updatedChat = { ...chat, ...payload };

        // skip update if no difference
        if (JSON.stringify(chat) === JSON.stringify(updatedChat)) {
          return state;
        }

        return {
          chats: {
            ...state.chats,
            [chatId]: updatedChat,
          },
        };
      });
    },

    pinChat: async (myMemberId: string, isPinned: boolean) => {
      try {
        const updatedMember = await chatMemberService.pinChat(
          myMemberId,
          isPinned
        );
        const chatId = updatedMember.chatId;

        if (chatId) {
          get().updateChatLocally(chatId, {
            pinnedAt: isPinned ? new Date() : null,
          });
        }

        toast.success(isPinned ? "Chat pinned" : "Chat unpinned");
      } catch (error) {
        handleError(error, "Failed to pin/unpin chat");
      }
    },

    setMute: async (
      chatId: string,
      memberId: string,
      mutedUntil: Date | null
    ) => {
      const updatedMuteUntil = await chatMemberService.setMute(
        memberId,
        mutedUntil
      );
      get().updateChatLocally(chatId, { mutedUntil: updatedMuteUntil });
    },

    addMembersToChat: async (chatId, userIds) => {
      set({ isLoading: true });
      await chatMemberService.addMembers(chatId, userIds);
      set({ isLoading: false });
    },

    setUnreadCount: (chatId: string, incrementBy: number) => {
      const isActiveChat = get().activeChatId === chatId;
      if (isActiveChat) return;

      const currentChat = get().chats[chatId];
      if (!currentChat) return;

      const newUnreadCount = (currentChat.unreadCount || 0) + incrementBy;
      get().updateChatLocally(chatId, { unreadCount: newUnreadCount });
    },

    setPinnedMessage: (chatId: string, message: MessageResponse | null) => {
      get().updateChatLocally(chatId, { pinnedMessage: message });
    },

    generateInviteLink: async (chatId: string) => {
      const newInviteLink = await chatService.generateInviteLink(chatId);
      get().updateChatLocally(chatId, { inviteLinks: [newInviteLink] });
      return newInviteLink;
    },

    refreshInviteLink: async (chatId: string, token: string) => {
      const newInviteLink = await chatService.refreshInviteLink(token);
      get().updateChatLocally(chatId, { inviteLinks: [newInviteLink] });
      return newInviteLink;
    },

    addToGroupPreviewMembers: (chatId: string, member: ChatMemberLite) => {
      const chat = get().chats[chatId];
      if (!chat || chat.type === ChatType.DIRECT || chat.avatarUrl) return;

      const currentPreviews = chat.previewMembers || [];
      const currentMemberIds = chat.otherMemberUserIds || [];

      const exists = currentPreviews.some((m) => m.userId === member.userId);

      if (!exists) {
        const updatedPreviews = [...currentPreviews, member].slice(0, 4);
        const updatedMemberIds = [...currentMemberIds, member.userId];

        get().updateChatLocally(chatId, {
          previewMembers: updatedPreviews,
          otherMemberUserIds: updatedMemberIds,
        });
      }
    },

    removeFromGroupPreviewMembers: (chatId: string, userId: string) => {
      const chat = get().chats[chatId];
      if (!chat || chat.type === ChatType.DIRECT || chat.avatarUrl) return;

      const updatedPreviews = (chat.previewMembers || []).filter(
        (m) => m.userId !== userId
      );

      const updatedMemberIds = (chat.otherMemberUserIds || []).filter(
        (id) => id !== userId
      );

      get().updateChatLocally(chatId, {
        previewMembers: updatedPreviews,
        otherMemberUserIds: updatedMemberIds,
      });
    },

    leaveChat: async (chatId) => {
      set({ isLoading: true });
      const currentUserId = useAuthStore.getState().currentUser?.id;
      if (!currentUserId) throw new Error("User not authenticated");

      const { chatDeleted } = await chatMemberService.DeleteMember(
        chatId,
        currentUserId
      );
      get().cleanupChat(chatId);
      window.history.pushState({}, "", "/");

      if (chatDeleted) {
        toast.info("This chat was deleted because no members remained.");
      } else {
        toast.success("You left the chat.");
      }

      set({ isLoading: false });
    },

    deleteChat: async (id) => {
      set({ isLoading: true });
      await chatService.deleteChat(id);
      get().cleanupChat(id);
      window.history.pushState({}, "", "/");
      toast.success("Chat deleted");
      set({ isLoading: false });
    },

    clearChats: () => {
      set({ chats: {}, chatIds: [], activeChatId: null });
    },

    cleanupChat: (chatId: string) => {
      useMessageStore.getState().clearChatMessages(chatId);
      useChatMemberStore.getState().clearChatMembers(chatId);
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [chatId]: removedChat, ...remainingChats } = state.chats;
        return {
          chats: remainingChats,
          chatIds: state.chatIds.filter((id) => id !== chatId),
          activeChatId:
            state.activeChatId === chatId ? null : state.activeChatId,
        };
      });
    },
  })
  //   {
  //     name: "chat-storage",
  //     partialize: (state) => ({
  //       activeChatId: state.activeChatId,
  //       chats: state.chats,
  //       chatIds: state.chatIds,
  //     }),
  //   }
  // )
);

// EXPORT HOOKS - UPDATED

export const useChat = (chatId: string) =>
  useChatStore((state) => state.chats[chatId]);

export const useActiveChat = () =>
  useChatStore((state) => state.getActiveChat());

export const useActiveChatId = () =>
  useChatStore((state) => state.activeChatId);

export const useIsActiveChat = (chatId: string) =>
  useChatStore(useShallow((state) => state.activeChatId === chatId));

export const useChatMap = () =>
  useChatStore(useShallow((state) => state.chats));

export const useAllChatIds = () => useChatStore((state) => state.chatIds);

export const getChats = () => {
  const state = useChatStore.getState();
  return state.chatIds.map((id) => state.chats[id]).filter(Boolean);
};

export const useChatsForFolderFilter = () =>
  useChatStore(
    useShallow((state) =>
      state.chatIds.map((chatId) => {
        const chat = state.chats[chatId];
        return {
          id: chat.id,
          type: chat.type,
          pinnedAt: chat.pinnedAt,
          updatedAt: chat.updatedAt,
        };
      })
    )
  );

export const useSavedChat = () => useChatStore((state) => state.savedChat);

export const useSetActiveSavedChat = () => {
  const getState = useChatStore;

  return async () => {
    const state = getState.getState();
    let savedChat = state.savedChat;

    if (!savedChat) {
      toast.warning("Saved chat not found, fetching from server...");
      try {
        const fetchedSavedChat = await chatService.fetchSavedChat();

        if (!fetchedSavedChat) {
          toast.error("Saved chat does not exist in the database!");
          return;
        }
        useChatStore.setState({ savedChat: fetchedSavedChat });
        savedChat = fetchedSavedChat;
      } catch (error) {
        handleError(error, "Failed to fetch saved chat");
      }
    }

    await state.setActiveChatId(savedChat.id);
  };
};
