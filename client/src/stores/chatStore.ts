import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Chat, Message, PaginatedResponse } from "@/data/types";

type ChatState = {
  activeChat: string | null;
  chats: Chat[];
  messages: Record<string, Message[]>; // Key is chatId
  loading: boolean;
  error: string | null;
};

type ChatActions = {
  setActiveChat: (chatId: string) => void;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string, page?: number) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  createChat: (participantIds: string[]) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addMessage: (chatId: string, message: Message) => void;
};

const initialState: ChatState = {
  activeChat: null,
  chats: [],
  messages: {},
  loading: false,
  error: null,
};

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setActiveChat: (chatId) => set({ activeChat: chatId }),
      
      loadChats: async () => {
        set({ loading: true, error: null });
        try {
          // API call to fetch chats
          const chats = await chatService.getChats();
          set({ chats, loading: false });
        } catch (error) {
          set({ error: "Failed to load chats", loading: false });
        }
      },
      
      loadMessages: async (chatId, page = 1) => {
        set({ loading: true, error: null });
        try {
          const response = await chatService.getMessages(chatId, page);
          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: [...(state.messages[chatId] || []), ...response.data]
            },
            loading: false
          }));
        } catch (error) {
          set({ error: "Failed to load messages", loading: false });
        }
      },
      
      // Other actions...
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        chats: state.chats,
        activeChat: state.activeChat
      })
    }
  )
);