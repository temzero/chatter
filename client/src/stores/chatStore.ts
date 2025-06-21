import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import { chatService } from "@/services/chat/chatService";
import { chatMemberService } from "@/services/chat/chatMemberService";
import { useMessageStore } from "./messageStore";
import { useAuthStore } from "./authStore";
import { useChatMemberStore } from "./chatMemberStore";
import { ChatType } from "@/types/enums/ChatType";
import type { ChatResponse } from "@/types/chat";
import type { LastMessageResponse } from "@/types/messageResponse";

interface ChatStore {
  chats: ChatResponse[];
  searchTerm: string;
  activeChat: ChatResponse | null;
  isLoading: boolean;
  error: string | null;
  filteredChats: ChatResponse[];

  initialize: () => Promise<void>;
  getChats: () => Promise<void>;
  fetchChatById: (chatId?: string) => Promise<void>;
  getDirectChatByUserId: (userId: string) => Promise<ChatResponse | null>;
  setActiveChat: (chat: ChatResponse | null) => Promise<void>;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  createOrGetDirectChat: (partnerId: string) => Promise<ChatResponse>;
  createGroupChat: (payload: {
    name: string;
    userIds: string[];
    type: ChatType.GROUP | ChatType.CHANNEL;
  }) => Promise<ChatResponse>;
  updateDirectChat: (id: string, payload: Partial<ChatResponse>) => Promise<void>;
  updateGroupChat: (id: string, payload: Partial<ChatResponse>) => Promise<void>;
  setLastMessage: (chatId: string, message: LastMessageResponse | null) => void;
  setSearchTerm: (term: string) => void;
  leaveGroupChat: (chatId: string) => Promise<void>;
  deleteChat: (id: string, type: ChatType) => Promise<void>;
  clearChats: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const cleanupChat = (chatId: string) => {
        useMessageStore.getState().clearChatMessages(chatId);
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          filteredChats: state.filteredChats.filter(
            (chat) => chat.id !== chatId
          ),
          activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
        }));
      };

      return {
        chats: [],
        filteredChats: [],
        searchTerm: "",
        activeChat: null,
        isLoading: false,
        error: null,

        initialize: async () => {
          try {
            set({ isLoading: true, error: null });
            await get().getChats();
            set({ isLoading: false });
          } catch (error) {
            console.error("Initialization failed:", error);
            set({ error: "Failed to initialize chat data", isLoading: false });
            throw error;
          }
        },

        getChats: async () => {
          set({ isLoading: true, error: null });
          try {
            const chats = await chatService.getAllChats();
            set({ chats, filteredChats: chats, isLoading: false });
          } catch (error) {
            console.error("Failed to fetch chats:", error);
            set({ error: "Failed to load chats", isLoading: false });
          }
        },

        fetchChatById: async (chatId) => {
          const targetChatId = chatId || get().activeChat?.id;
          if (!targetChatId) return;

          set({ isLoading: true });
          try {
            const chat = await chatService.fetchChatById(targetChatId);
            set((state) => ({
              chats: state.chats.some((c) => c.id === targetChatId)
                ? state.chats.map((c) => (c.id === targetChatId ? chat : c))
                : [...state.chats, chat],
              activeChat:
                state.activeChat?.id === targetChatId ? chat : state.activeChat,
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to fetch chat:", error);
            set({ error: "Failed to load chat", isLoading: false });
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
          return null;
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
          if (!chat) {
            set({ activeChat: null, isLoading: false });
            return;
          }

          const { messages } = useMessageStore.getState();
          const { chatMembers } = useChatMemberStore.getState();
          const alreadyFetchedMessages = !!messages[chat.id];
          const alreadyFetchedMembers = !!chatMembers[chat.id];

          set({ activeChat: chat, isLoading: true });
          window.history.pushState({}, "", `/${chat.id}`);

          try {
            const fetchMessagesPromise = alreadyFetchedMessages
              ? null
              : useMessageStore.getState().fetchMessages(chat.id);

            const fetchMembersPromise =
              alreadyFetchedMembers || chat.type === ChatType.DIRECT
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
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to set active chat:", error);
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
            set({ isLoading: false });
            return payload;
          } catch (error) {
            console.error("Failed to create/get direct chat:", error);
            set({ error: "Failed to create chat", isLoading: false });
            throw error;
          }
        },

        createGroupChat: async (payload) => {
          set({ isLoading: true });
          try {
            const newChat = await chatService.createGroupChat(payload);
            set((state) => ({
              chats: [newChat, ...state.chats],
              filteredChats: [newChat, ...state.filteredChats],
              isLoading: false,
            }));
            return newChat;
          } catch (error) {
            console.error("Failed to create group chat:", error);
            set({ error: "Failed to create chat", isLoading: false });
            throw error;
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
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to update direct chat:", error);
            set({ error: "Failed to update direct chat", isLoading: false });
            throw error;
          }
        },

        updateGroupChat: async (id, payload) => {
          set({ isLoading: true });
          try {
            const updatedChat = await chatService.updateGroupChat(id, payload);
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
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to update group chat:", error);
            set({ error: "Failed to update group chat", isLoading: false });
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

        leaveGroupChat: async (chatId) => {
          set({ isLoading: true });
          try {
            const currentUserId = useAuthStore.getState().currentUser?.id;
            if (!currentUserId) throw new Error("User not authenticated");
            await chatMemberService.removeMember(chatId, currentUserId);
            cleanupChat(chatId);
            set({ isLoading: false });
          } catch (error) {
            console.error("Failed to leave chat:", error);
            set({ error: "Failed to leave chat", isLoading: false });
            throw error;
          }
        },

        deleteChat: async (id, type) => {
          set({ isLoading: true });
          try {
            await chatService.deleteChat(id, type);
            cleanupChat(id);
            set({ isLoading: false });
          } catch (error) {
            console.error("Failed to delete chat:", error);
            set({ error: "Failed to delete chat", isLoading: false });
            throw error;
          }
        },

        clearChats: () => {
          set({ chats: [], filteredChats: [], activeChat: null });
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
