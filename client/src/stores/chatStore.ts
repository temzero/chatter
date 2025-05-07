import { create } from "zustand";
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

  getChats: (userId: string) => Promise<void>;
  getChatById: (chatId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setActiveChat: (chat: Chat | null) => void;
  createChat: (payload: {
    participants: string[];
    isGroup?: boolean;
  }) => Promise<void>;
  updateChat: (id: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  searchTerm: "",
  activeChat: null,

  getChats: async (userId) => {
    try {
      // Choose one of these based on your needs:
      // const chats = await chatService.getAllChats(); // For all chats (admin)
      // const chats = await chatService.getChatsByUserId(userId); // For user-specific chats
      const chats = await chatService.getAllChatsByUserId(userId); // For all conversations (private + groups)
      set({ chats });
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  },

  getChatById: async (chatId) => {
    try {
      const chat = await chatService.getChatById(chatId);
      set((state) => ({
        chats: state.chats.some((c) => c.id === chatId)
          ? state.chats.map((c) => (c.id === chatId ? chat : c))
          : [...state.chats, chat],
        activeChat: state.activeChat?.id === chatId ? chat : state.activeChat,
      }));
    } catch (error) {
      console.error("Failed to fetch chat:", error);
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

  createChat: async (payload) => {
    try {
      const newChat = await chatService.createChat(payload);
      set((state) => ({ chats: [newChat, ...state.chats] }));
      return newChat; // Return the created chat for immediate use if needed
    } catch (error) {
      console.error("Failed to create chat:", error);
      throw error; // Re-throw to handle in UI if needed
    }
  },

  updateChat: async (id, updates) => {
    try {
      const updatedChat = await chatService.updateChat(id, updates);
      set((state) => ({
        chats: state.chats.map((chat) => (chat.id === id ? updatedChat : chat)),
        activeChat:
          state.activeChat?.id === id ? updatedChat : state.activeChat,
      }));
      return updatedChat; // Return the updated chat for immediate use if needed
    } catch (error) {
      console.error("Failed to update chat:", error);
      throw error; // Re-throw to handle in UI if needed
    }
  },

  deleteChat: async (id) => {
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
      }));
    } catch (error) {
      console.error("Failed to delete chat:", error);
      throw error; // Re-throw to handle in UI if needed
    }
  },
}));

// Optional: A hook to get filtered chats by search term
export const useFilteredChats = () =>
  useChatStore((state) =>
    state.chats.filter((chat) =>
      chat.name?.toLowerCase().includes(state.searchTerm.toLowerCase())
    )
  );
