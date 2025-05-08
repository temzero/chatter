import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chat } from "@/types/chat";
import { chatService } from "@/services/chatService";
import {
  useMessageStore,
  getMessagesByChatId,
  getMediaFromMessages,
} from "./messageStore";

interface ChatStore {
  chats: Chat[];
  searchTerm: string;
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;

  getChats: (userId: string) => Promise<void>;
  getChatById: (chatId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setActiveChat: (chat: Chat | null) => void;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  createChat: (payload: {
    participants: string[];
    isGroup?: boolean;
  }) => Promise<void>;
  updateChat: (id: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      searchTerm: "",
      activeChat: null,
      isLoading: false,
      error: null,

      getChats: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const chats: Chat[] = await chatService.getAllChatsByUserId(userId);
          set({ chats, isLoading: false });
          console.log("fetched Chats:", chats);

        } catch (error) {
          console.error("Failed to fetch chats:", error);
          set({
            error: "Failed to load chats",
            isLoading: false,
          });
        }
      },

      getChatById: async (chatId) => {
        set({ isLoading: true });
        try {
          const chat = await chatService.getChatById(chatId);
          set((state) => ({
            chats: state.chats.some((c) => c.id === chatId)
              ? state.chats.map((c) => (c.id === chatId ? chat : c))
              : [...state.chats, chat],
            activeChat:
              state.activeChat?.id === chatId ? chat : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Failed to fetch chat:", error);
          set({
            error: "Failed to load chat",
            isLoading: false,
          });
        }
      },

      setSearchTerm: (term) => set({ searchTerm: term }),

      setActiveChat: (chat) => {
        const allMessages = useMessageStore.getState().messages;
        const activeMessages = chat
          ? getMessagesByChatId(chat.id, allMessages)
          : [];
        const activeMedia = getMediaFromMessages(activeMessages);

        useMessageStore.setState({
          activeMessages,
          activeMedia,
        });

        set({ activeChat: chat });
      },

      setActiveChatById: async (chatId: string | null) => {
        if (!chatId) {
          get().setActiveChat(null);
          return;
        }

        try {
          // Check if we already have the chat in store
          const existingChat = get().chats.find(c => c.id === chatId);
          
          if (existingChat) {
            get().setActiveChat(existingChat);
          } else {
            // Fetch the chat if not in store
            await get().getChatById(chatId);
            const chat = get().chats.find(c => c.id === chatId);
            if (chat) {
              get().setActiveChat(chat);
            }
          }
        } catch (error) {
          console.error("Failed to set active chat:", error);
          set({ error: "Failed to load chat" });
        }
      },

      createChat: async (payload) => {
        set({ isLoading: true });
        try {
          const newChat = await chatService.createChat(payload);
          set((state) => ({
            chats: [newChat, ...state.chats],
            isLoading: false,
          }));
          return newChat;
        } catch (error) {
          console.error("Failed to create chat:", error);
          set({
            error: "Failed to create chat",
            isLoading: false,
          });
          throw error;
        }
      },

      updateChat: async (id, updates) => {
        set({ isLoading: true });
        try {
          const updatedChat = await chatService.updateChat(id, updates);
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === id ? updatedChat : chat
            ),
            activeChat:
              state.activeChat?.id === id ? updatedChat : state.activeChat,
            isLoading: false,
          }));
          return updatedChat;
        } catch (error) {
          console.error("Failed to update chat:", error);
          set({
            error: "Failed to update chat",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteChat: async (id) => {
        set({ isLoading: true });
        try {
          await chatService.deleteChat(id);

          useMessageStore.setState((msgState) => {
            const filteredMessages = msgState.messages.filter(
              (m) => m.chat.id !== id
            );
            const isDeletingActive = get().activeChat?.id === id;
            return {
              messages: filteredMessages,
              activeMessages: isDeletingActive ? [] : msgState.activeMessages,
              activeMedia: isDeletingActive ? [] : msgState.activeMedia,
            };
          });

          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== id),
            activeChat: state.activeChat?.id === id ? null : state.activeChat,
            isLoading: false,
          }));
        } catch (error) {
          console.error("Failed to delete chat:", error);
          set({
            error: "Failed to delete chat",
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        activeChat: state.activeChat, // Only persist the active chat
      }),
    }
  )
);

// Hook to get filtered chats
export const useFilteredChats = () =>
  useChatStore((state) =>
    state.chats.filter((chat) =>
      chat.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
  );
