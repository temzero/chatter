import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { chatService } from "@/services/chat/chatService";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useMessageStore } from "./messageStore";
import { useAuthStore } from "./authStore";
import { useChatMemberStore } from "./chatMemberStore";
import { ChatType } from "@/types/enums/ChatType";
import type { ChatResponse } from "@/types/responses/chat.response";
import type {
  LastMessageResponse,
  MessageResponse,
} from "@/types/responses/message.response";
import { toast } from "react-toastify";
import { useModalStore } from "./modalStore";
import { useSidebarInfoStore } from "./sidebarInfoStore";
import { handleError } from "@/utils/handleError";

interface ChatStore {
  chats: ChatResponse[];
  savedChat: ChatResponse | null;
  searchTerm: string;
  activeChat: ChatResponse | null;
  isLoading: boolean;
  error: string | null;
  filteredChats: ChatResponse[];

  initialize: () => Promise<void>;
  fetchChats: () => Promise<void>;
  fetchChatById: (
    chatId?: string,
    options?: { fetchFullData?: boolean }
  ) => Promise<ChatResponse>;
  getDirectChatByUserId: (userId: string) => Promise<ChatResponse | void>;
  setActiveChat: (chat: ChatResponse | null) => Promise<void>;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  getAllUserIdsInChats: () => string[];
  createOrGetDirectChat: (partnerId: string) => Promise<ChatResponse>;
  createGroupChat: (payload: {
    name: string;
    userIds: string[];
    type: ChatType.GROUP | ChatType.CHANNEL;
  }) => Promise<ChatResponse>;
  updateDirectChat: (
    id: string,
    payload: Partial<ChatResponse>
  ) => Promise<void>;
  updateGroupChatLocally: (id: string, payload: Partial<ChatResponse>) => void;
  updateGroupChat: (
    id: string,
    payload: Partial<ChatResponse>
  ) => Promise<void>;
  addMembersToChat: (chatId: string, userIds: string[]) => Promise<void>;
  setMute: (chatId: string, memberId: string, mutedUntil: Date | null) => void;
  setLastMessage: (chatId: string, message: LastMessageResponse | null) => void;
  setUnreadCount: (chatId: string, incrementBy: number) => void;
  setPinnedMessage: (chatId: string, message: MessageResponse | null) => void;
  setSearchTerm: (term: string) => void;
  leaveChat: (chatId: string) => Promise<void>;
  deleteChat: (id: string, type: ChatType) => Promise<void>;
  cleanupChat: (chatId: string) => void;
  clearChats: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      return {
        chats: [],
        savedChat: null,
        filteredChats: [],
        searchTerm: "",
        activeChat: null,
        isLoading: false,
        error: null,

        initialize: async () => {
          try {
            set({ isLoading: true, error: null });
            await get().fetchChats();
          } catch (error) {
            console.error("Initialization failed:", error);
            set({ error: "Failed to initialize chat data" });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        fetchChats: async () => {
          set({ isLoading: true, error: null });
          try {
            const allChats = await chatService.fetchAllChats();

            const savedChat =
              allChats.find((chat) => chat.type === ChatType.SAVED) || null;
            const otherChats = allChats.filter(
              (chat) => chat.type !== ChatType.SAVED
            );

            set({
              savedChat,
              chats: otherChats,
              filteredChats: otherChats,
            });

            console.log("Chats fetched:", otherChats);
            console.log("Saved chat:", savedChat);
          } catch (error) {
            console.error("Failed to fetch chats:", error);
            set({ error: "Failed to load chats" });
            handleError(error, "Failed to load chats");
          } finally {
            set({ isLoading: false });
          }
        },

        fetchChatById: async (chatId, options = { fetchFullData: false }) => {
          const targetChatId = chatId || get().activeChat?.id;
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
              activeChat:
                state.activeChat?.id === targetChatId ? chat : state.activeChat,
            }));

            // Optionally fetch full data
            if (options.fetchFullData) {
              await Promise.all([
                useChatMemberStore
                  .getState()
                  .fetchChatMembers(targetChatId, chat.type),
                useMessageStore.getState().fetchMessages(targetChatId),
              ]);
            }

            return chat;
          } catch (error) {
            set({ activeChat: null });
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

        setSearchTerm: (term) => {
          const { chats } = get();
          const trimmed = term.trim().toLowerCase();

          if (!trimmed) {
            set({ searchTerm: term, filteredChats: chats });
            return;
          }

          const filtered = chats.filter((chat) => {
            return chat.name?.toLowerCase().includes(trimmed);
          });

          set({ searchTerm: term, filteredChats: filtered });
        },

        setActiveChat: async (chat) => {
          useSidebarInfoStore.getState().setSidebarInfo();
          useMessageStore.getState().setDisplaySearchMessage(false);
          if (!chat) {
            set({ activeChat: null, isLoading: false });
            useModalStore.getState().setReplyToMessageId(null);
            return;
          }

          const { messages } = useMessageStore.getState();
          const { chatMembers } = useChatMemberStore.getState();
          const alreadyFetchedMessages = !!messages[chat.id];
          const alreadyFetchedMembers = !!chatMembers[chat.id];

          set({ activeChat: chat, isLoading: true });
          window.history.pushState({}, "", `/${chat.id}`);
          useModalStore.getState().setReplyToMessageId(null);

          try {
            const fetchMessagesPromise = alreadyFetchedMessages
              ? null
              : useMessageStore.getState().fetchMessages(chat.id);

            const fetchMembersPromise = alreadyFetchedMembers
              ? null
              : useChatMemberStore
                  .getState()
                  .fetchChatMembers(chat.id, chat.type);

            await Promise.all(
              [fetchMessagesPromise, fetchMembersPromise].filter(Boolean)
            );

            set((state) => ({
              chats: state.chats.map((c) =>
                c.id === chat.id ? { ...c, unreadCount: 0 } : c
              ),
              filteredChats: state.filteredChats.map((c) =>
                c.id === chat.id ? { ...c, unreadCount: 0 } : c
              ),
            }));
          } catch (error) {
            handleError(error, "Failed to set active chat");
          } finally {
            set({ isLoading: false });
          }
        },

        setActiveChatById: async (chatId) => {
          if (!chatId) {
            await get().setActiveChat(null);
            return;
          }

          const existingChat = get().chats.find((chat) => chat.id === chatId);
          if (existingChat) {
            await get().setActiveChat(existingChat);
          } else {
            await get().fetchChatById(chatId);
            const fetchedChat = get().chats.find((chat) => chat.id === chatId);
            if (fetchedChat) await get().setActiveChat(fetchedChat);
          }
        },

        getAllUserIdsInChats: () => {
          const chats = get().chats;
          const allUserIds = new Set<string>();

          chats.forEach((chat) => {
            chat.otherMemberUserIds?.forEach((userId) =>
              allUserIds.add(userId)
            );
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
                filteredChats: [payload, ...state.filteredChats],
              }));
            }

            await get().setActiveChat(payload);
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
              filteredChats: [newChat, ...state.filteredChats],
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

        updateDirectChat: async (id, payload) => {
          set({ isLoading: true });
          try {
            const updatedChat = await chatService.updateDirectChat(id, payload);
            set((state) => ({
              chats: state.chats.map((chat) =>
                chat.id === id ? { ...chat, ...updatedChat } : chat
              ),
              filteredChats: state.filteredChats.map((chat) =>
                chat.id === id ? { ...chat, ...updatedChat } : chat
              ),
              activeChat:
                state.activeChat?.id === id
                  ? { ...state.activeChat, ...updatedChat }
                  : state.activeChat,
            }));
          } catch (error) {
            set({ error: "Failed to update direct chat" });
            handleError(error, "Failed to update chat");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        updateGroupChatLocally: (id, payload) => {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === id ? { ...chat, ...payload } : chat
            ),
            filteredChats: state.filteredChats.map((chat) =>
              chat.id === id ? { ...chat, ...payload } : chat
            ),
            activeChat:
              state.activeChat?.id === id
                ? { ...state.activeChat, ...payload }
                : state.activeChat,
          }));
        },

        updateGroupChat: async (id, payload) => {
          set({ isLoading: true });
          try {
            const updatedChat = await chatService.updateGroupChat(id, payload);
            get().updateGroupChatLocally(id, updatedChat);
          } catch (error) {
            set({ error: "Failed to update group chat" });
            handleError(error, "Failed to update group chat");
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        addMembersToChat: async (chatId, userIds) => {
          set({ isLoading: true });
          try {
            // 1. Call your API/service to add the user
            await chatMemberService.addMembers(chatId, userIds); // must exist in your service

            // // 2. Optional: Refetch chat to get updated members
            // await get().fetchChatById(chatId);
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

            set((state) => ({
              chats: state.chats.map((chat) =>
                chat.id === chatId
                  ? {
                      ...chat,
                      mutedUntil: updatedMuteUntil,
                    }
                  : chat
              ),
              filteredChats: state.filteredChats.map((chat) =>
                chat.id === chatId
                  ? {
                      ...chat,
                      mutedUntil: updatedMuteUntil,
                    }
                  : chat
              ),
              activeChat:
                state.activeChat?.id === chatId
                  ? {
                      ...state.activeChat,
                      mutedUntil: updatedMuteUntil,
                    }
                  : state.activeChat,
            }));
          } catch (error) {
            handleError(error, "Failed to set mute");
            throw error;
          }
        },

        setLastMessage: (chatId, message) => {
          if (!chatId || !message) return;
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId ? { ...chat, lastMessage: message } : chat
            ),
            filteredChats: state.filteredChats.map((chat) =>
              chat.id === chatId ? { ...chat, lastMessage: message } : chat
            ),
            activeChat:
              state.activeChat?.id === chatId
                ? { ...state.activeChat, lastMessage: message }
                : state.activeChat,
          }));
        },

        setUnreadCount: (chatId: string, incrementBy: number) => {
          const isActiveChat = get().activeChat?.id === chatId;
          console.log("isActiveChat", isActiveChat);
          if (isActiveChat) return;
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    unreadCount: (chat.unreadCount || 0) + incrementBy,
                  }
                : chat
            ),
            filteredChats: state.filteredChats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    unreadCount: (chat.unreadCount || 0) + incrementBy,
                  }
                : chat
            ),
          }));
        },

        setPinnedMessage: (chatId: string, message: MessageResponse | null) => {
          console.log("setPinnedMessage: ", chatId, message);
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId ? { ...chat, pinnedMessage: message } : chat
            ),
            filteredChats: state.filteredChats.map((chat) =>
              chat.id === chatId ? { ...chat, pinnedMessage: message } : chat
            ),
            activeChat:
              state.activeChat?.id === chatId
                ? { ...state.activeChat, pinnedMessage: message }
                : state.activeChat,
          }));
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
          set({ chats: [], filteredChats: [], activeChat: null });
        },

        cleanupChat: (chatId: string) => {
          useMessageStore.getState().clearChatMessages(chatId);
          useChatMemberStore.getState().clearChatMembers(chatId);
          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== chatId),
            filteredChats: state.filteredChats.filter(
              (chat) => chat.id !== chatId
            ),
            activeChat:
              state.activeChat?.id === chatId ? null : state.activeChat,
          }));
        },
      };
    },
    {
      name: "chat-storage",
      partialize: (state) => ({
        activeChat: state.activeChat,
        chats: state.chats,
      }),
    }
  )
);

export const useActiveChat = () =>
  useChatStore(useShallow((s) => s.activeChat));
export const useActiveChatId = () =>
  useChatStore(useShallow((s) => s.activeChat?.id));
export const useIsActiveChat = (chatId: string) =>
  useChatStore((state) => state.activeChat?.id === chatId);
export const useAllChats = () => useChatStore(useShallow((s) => s.chats));

// Saved chat
export const useSavedChat = () => useChatStore(useShallow((s) => s.savedChat));

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
        // Optional: store it in state.savedChat
        useChatStore.setState({ savedChat: fetchedSavedChat });
        savedChat = fetchedSavedChat;
      } catch (error) {
        toast.error("Error while fetching saved chat!");
        console.error("Failed to fetch saved chat:", error);
        return;
      }
    }

    await state.setActiveChat(savedChat);
  };
};
