// src/stores/typingStore.ts
import { create } from "zustand";

interface TypingState {
  // chatId -> userId -> isTyping
  typingMap: Record<string, Record<string, boolean>>;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  getTypingUsers: (chatId: string) => string[]; // Returns array of typing user IDs
}

export const useTypingStore = create<TypingState>((set, get) => ({
  typingMap: {},

  setTyping: (chatId, userId, isTyping) => {
    set((state) => ({
      typingMap: {
        ...state.typingMap,
        [chatId]: {
          ...(state.typingMap[chatId] || {}),
          [userId]: isTyping,
        },
      },
    }));
  },

  getTypingUsers: (chatId) => {
    const chatTyping = get().typingMap[chatId] || {};
    return Object.entries(chatTyping)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, isTyping]) => isTyping)
      .map(([userId]) => userId);
  },
}));
