import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chat } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { useMessageStore } from "./messageStore";

interface ChatStore {
  chats: Chat[];
  searchTerm: string;
  activeChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  filteredChats: Chat[];

  getChats: (userId: string) => Promise<void>;
  getChatById: (chatId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setActiveChat: (chat: Chat | null) => void;
  setActiveChatById: (chatId: string | null) => Promise<void>;
  createChat: (payload: {
    member1Id: string;
    member2Id: string;
  }) => Promise<Chat>;
  createGroup: (payload: {
    name: string;
    memberIds: string[];
    type: "group" | "channel";
  }) => Promise<Chat>;
  updateChat: (id: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      filteredChats: [],
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
          const chat: Chat = await chatService.getChatById(chatId);
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

      setSearchTerm: (term) => {
        const { chats } = get();

        // If search term is empty, show all chats
        if (!term.trim()) {
          set({
            searchTerm: term,
            filteredChats: chats,
          });
          return;
        }

        const lowerCaseTerm = term.toLowerCase();

        // Filter chats based on search term
        const filtered = chats.filter((chat) => {
          // Search in chat name
          const nameMatch = chat.name?.toLowerCase().includes(lowerCaseTerm);

          // For private chats, also search in partner's name
          if (chat.type === "private") {
            const partnerNameMatch = chat.chatPartner?.first_name
              ?.toLowerCase()
              .includes(lowerCaseTerm);

            return nameMatch || partnerNameMatch;
          }

          return nameMatch;
        });

        set({
          searchTerm: term,
          filteredChats: filtered,
        });
      },

      setActiveChat: (chat) => {
        set({ activeChat: chat });
      },

      setActiveChatById: async (chatId: string | null) => {
        if (!chatId) {
          get().setActiveChat(null);
          return;
        }

        try {
          const existingChat = get().chats.find((chat) => chat.id === chatId);
          if (existingChat) {
            get().setActiveChat(existingChat);
          } else {
            console.error("Cannot find chat in existing chats");
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

      createGroup: async (payload) => {
        set({ isLoading: true });
        try {
          const newChat = await chatService.createGroup(payload);
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
        activeChat: state.activeChat,
        chats: state.chats,
      }),
    }
  )
);
