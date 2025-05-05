// src/stores/chatStore.ts
import { create } from "zustand";
import { Message, Chat, User } from "../types/chatTypes";

type Message = {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  isEdited?: boolean;
  replyTo?: Message;
  attachments?: Array<{
    type: "image" | "video" | "document" | "audio";
    url: string;
    name?: string;
    size?: number;
  }>;
};

type Chat = {
  id: string;
  type: "private" | "group" | "channel";
  title: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  avatar?: string;
};

type ChatState = {
  chats: Chat[];
  currentChatId: string | null;
  messages: Record<string, Message[]>; // chatId -> messages
  onlineUsers: string[]; // array of user IDs
  isLoading: boolean;
  error: string | null;
};

type ChatActions = {
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  setCurrentChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  editMessage: (chatId: string, messageId: string, newContent: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  markAsRead: (chatId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  clearError: () => void;
};

const initialState: ChatState = {
  chats: [],
  currentChatId: null,
  messages: {},
  onlineUsers: [],
  isLoading: false,
  error: null,
};

export const useChatStore = create<ChatState & ChatActions>()((set, get) => ({
  ...initialState,
  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      messages: Object.fromEntries(
        Object.entries(state.messages).filter(([id]) => id !== chatId)
      ),
    })),
  setCurrentChat: (chatId) => set({ currentChatId: chatId }),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              unreadCount:
                chat.id === state.currentChatId ? 0 : chat.unreadCount + 1,
            }
          : chat
      ),
    })),
  editMessage: (chatId, messageId, newContent) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId]?.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg
        ),
      },
    })),
  deleteMessage: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId]?.filter((msg) => msg.id !== messageId),
      },
    })),
  markAsRead: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ),
    })),
  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: [...new Set([...state.onlineUsers, userId])],
    })),
  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),
  clearError: () => set({ error: null }),
}));

// Utility hooks
export const useCurrentChat = () =>
  useChatStore((state) => {
    if (!state.currentChatId) return null;
    return state.chats.find((chat) => chat.id === state.currentChatId) || null;
  });

export const useChatMessages = (chatId: string) =>
  useChatStore((state) => state.messages[chatId] || []);

export const useOnlineStatus = (userId: string) =>
  useChatStore((state) => state.onlineUsers.includes(userId));
