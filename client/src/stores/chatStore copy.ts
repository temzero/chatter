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
import type {
  ChatResponse,
  ChatDataResponse,
  ChatMemberLite,
} from "@/shared/types/responses/chat.response";
import type {
  LastMessageResponse,
  MessageResponse,
} from "@/shared/types/responses/message.response";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { useShallow } from "zustand/shallow";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";

interface ChatStoreState {
  activeChatId: string | null;
  chats: ChatResponse[];
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
  setLastMessage: (chatId: string, message: LastMessageResponse | null) => void;
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
  chats: [],
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
      const chats: ChatResponse[] = [];
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
          chats.push(chatData);
        }
      });

      // --- Update chat store ---
      set({
        savedChat,
        chats,
        hasMoreChats: data.hasMore,
      });
    },
    getChatById: (chatId?: string) => {
      if (!chatId) return undefined;
      const chat = get().chats.find((c) => c.id === chatId);
      return chat;
    },

    getActiveChat: () => {
      const { activeChatId, chats } = get();
      if (!activeChatId) return null;
      return chats.find((chat) => chat.id === activeChatId) || null;
    },

    getOrFetchChatById: async (
      chatId: string,
      options = { fetchFullData: false }
    ) => {
      const { getChatById, fetchChatById } = get();

      // 1. Try get from store
      const existingChat = getChatById(chatId);
      if (existingChat) {
        // If already cached, just return it
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
      const { chats, hasMoreChats, isLoading } = get();
      if (isLoading || !hasMoreChats) return 0; // return 0 if no load

      const lastChat = get().chats[get().chats.length - 1];
      if (!lastChat?.id) return 0;

      set({ isLoading: true });
      try {
        const { chats: newChats, hasMore } = await chatService.fetchChats({
          offset: chats.length,
          limit,
          lastId: lastChat.id,
        });

        if (newChats.length > 0) {
          const filteredNewChats = newChats.filter(
            (chat) => chat.type !== ChatType.SAVED
          );

          set({
            chats: [...chats, ...filteredNewChats],
            hasMoreChats: hasMore,
          });

          return filteredNewChats.length; // <-- Return number of chats loaded
        } else {
          set({ hasMoreChats: hasMore });
          return 0; // no chats loaded
        }
      } catch (error) {
        handleError(error, "Failed to load more chats");
        return 0;
      } finally {
        set({ isLoading: false });
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
        set((state) => ({
          chats: state.chats.some((c) => c.id === targetChatId)
            ? state.chats.map((c) => (c.id === targetChatId ? chat : c))
            : [chat, ...state.chats],
        }));

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
        handleError(error, "Failed to fetch chat");
        window.history.pushState({}, "", "/");
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    getDirectChatByUserId: async (userId) => {
      const existingChat = get().chats.find(
        (chat) =>
          chat.type === ChatType.DIRECT &&
          chat.otherMemberUserIds?.includes(userId)
      );
      if (existingChat) {
        await get().fetchChatById(existingChat.id);
        return existingChat;
      }
      return;
    },

    setActiveChatId: async (chatId) => {
      console.log("setActiveChatId");
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

      // get().fetchChatData(chatId);
    },

    fetchChatData: async (chatId: string) => {
      set({ isLoading: true });
      try {
        const alreadyFetchedMessages =
          !!useMessageStore.getState().messages[chatId];
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
      } catch (error) {
        handleError(error, "Failed to fetch active chat data");
      } finally {
        set({ isLoading: false });
      }
    },

    getAllUserIdsInChats: () => {
      const chats = get().chats;
      const allUserIds = new Set<string>();

      chats.forEach((chat) => {
        chat.otherMemberUserIds?.forEach((userId) => allUserIds.add(userId));
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
            chats: [payload, ...state.chats],
          }));
        }

        await get().setActiveChatId(payload.id);
        return payload;
      } catch (error) {
        set({ error: "Failed to create chat" });
        handleError(error, "Failed to create/get direct chat:");
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    createGroupChat: async (payload) => {
      set({ isLoading: true });
      try {
        const newChat = await chatService.createGroupChat(payload);
        set((state) => ({
          chats: [newChat, ...state.chats],
        }));
        return newChat;
      } catch (error) {
        console.error("Failed to create group chat:", error);
        set({ error: "Failed to create chat" });
        handleError(error, "Failed to create group chat");
        throw error;
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
        handleError(error, "Failed to update chat");
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateChatLocally: (chatId: string, payload: Partial<ChatResponse>) => {
      set((state) => {
        const updateFn = (chat: ChatResponse) => ({ ...chat, ...payload });

        return {
          chats: state.chats.map((chat) =>
            chat.id === chatId ? updateFn(chat) : chat
          ),
        };
      });
    },

    pinChat: async (myMemberId: string, isPinned: boolean) => {
      try {
        // 1. Pin/unpin the member via API
        const updatedMember = await chatMemberService.pinChat(
          myMemberId,
          isPinned
        );

        // 2. Update the corresponding chat's pinnedAt field in the store
        const chatId = updatedMember.chatId;
        if (chatId) {
          get().updateChatLocally(chatId, {
            pinnedAt: isPinned ? new Date() : null,
          });
        }

        // Optional: show toast
        toast.success(isPinned ? "Chat pinned" : "Chat unpinned");
      } catch (error) {
        handleError(error, "Failed to pin/unpin chat");
      }
    },

    addMembersToChat: async (chatId, userIds) => {
      set({ isLoading: true });
      try {
        await chatMemberService.addMembers(chatId, userIds);
      } catch (error) {
        handleError(error, "Error adding user to chat");
      } finally {
        set({ isLoading: false });
      }
    },

    setMute: async (
      chatId: string,
      memberId: string,
      mutedUntil: Date | null
    ) => {
      try {
        const updatedMuteUntil = await chatMemberService.setMute(
          memberId,
          mutedUntil
        );

        get().updateChatLocally(chatId, { mutedUntil: updatedMuteUntil });
      } catch (error) {
        handleError(error, "Failed to set mute");
        throw error;
      }
    },

    setLastMessage: (chatId, message) => {
      if (!chatId || !message) return;
      get().updateChatLocally(chatId, { lastMessage: message });
    },

    setUnreadCount: (chatId: string, incrementBy: number) => {
      const isActiveChat = get().activeChatId === chatId;
      if (isActiveChat) return;
      const currentChat = get().chats.find((c) => c.id === chatId);
      if (!currentChat) return;
      const newUnreadCount = (currentChat.unreadCount || 0) + incrementBy;
      get().updateChatLocally(chatId, { unreadCount: newUnreadCount });
    },

    setPinnedMessage: (chatId: string, message: MessageResponse | null) => {
      get().updateChatLocally(chatId, { pinnedMessage: message });
    },

    generateInviteLink: async (chatId: string) => {
      try {
        const newInviteLink = await chatService.generateInviteLink(chatId);
        get().updateChatLocally(chatId, { inviteLinks: [newInviteLink] });
        return newInviteLink;
      } catch (error) {
        handleError(error, "Failed to generate invite link");
        throw error;
      }
    },

    refreshInviteLink: async (chatId: string, token: string) => {
      try {
        const newInviteLink = await chatService.refreshInviteLink(token);
        get().updateChatLocally(chatId, { inviteLinks: [newInviteLink] });
        return newInviteLink;
      } catch (error) {
        handleError(error, "Failed to refresh invite link");
        throw error;
      }
    },

    addToGroupPreviewMembers: (chatId: string, member: ChatMemberLite) => {
      const chat = get().chats.find((c) => c.id === chatId);
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
      const chat = get().chats.find((c) => c.id === chatId);
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
      try {
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
      } catch (error) {
        console.error("Failed to leave chat:", error);
        set({ error: "Failed to leave chat" });
        handleError(error, "Failed to leave chat");
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteChat: async (id) => {
      set({ isLoading: true });
      try {
        await chatService.deleteChat(id);
        get().cleanupChat(id);
        window.history.pushState({}, "", "/");
        toast.success("Chat deleted");
      } catch (error) {
        set({ error: "Failed to delete chat" });
        handleError(error, "Failed to delete chat");
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    clearChats: () => {
      set({ chats: [], activeChatId: null });
    },

    cleanupChat: (chatId: string) => {
      useMessageStore.getState().clearChatMessages(chatId);
      useChatMemberStore.getState().clearChatMembers(chatId);
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
      }));
    },
  })
  //   {
  //     name: "chat-storage",
  //     partialize: (state) => ({
  //       activeChatId: state.activeChatId,
  //       chats: state.chats,
  //     }),
  //   }
  // )
);

// EXPORT HOOKS

export const useChat = (chatId: string) =>
  useChatStore((state) => state.chats.find((chat) => chat.id === chatId));

export const useActiveChat = () =>
  useChatStore((state) => state.getActiveChat());

export const useActiveChatId = () =>
  useChatStore((state) => state.activeChatId);

export const useAllChats = () =>
  useChatStore(useShallow((state) => state.chats));

export const useAllChatIds = () =>
  useChatStore(useShallow((state) => state.chats.map((chat) => chat.id)));

export const useChatsForFolderFilter = () =>
  useChatStore(
    useShallow((state) =>
      state.chats.map((chat) => ({
        id: chat.id,
        type: chat.type,
        pinnedAt: chat.pinnedAt,
        updatedAt: chat.updatedAt,
      }))
    )
  );

export const useSavedChat = () => useChatStore((state) => state.savedChat);

export const useIsActiveChat = (chatId: string) =>
  useChatStore(useShallow((state) => state.activeChatId === chatId));

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
        toast.error("Error while fetching saved chat!");
        console.error("Failed to fetch saved chat:", error);
        return;
      }
    }

    await state.setActiveChatId(savedChat.id);
  };
};
