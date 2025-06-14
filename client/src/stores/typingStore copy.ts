import { create } from "zustand";

interface TypingState {
  // chatId -> userId -> isTyping
  typingMap: Record<string, Record<string, boolean>>;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  clearTyping: (chatId: string, userId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingMap: {},

  // Immediate state update for typing status
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

  // Optional: Explicit clear function
  clearTyping: (chatId, userId) => {
    set((state) => {
      const chatTyping = { ...(state.typingMap[chatId] || {}) };
      delete chatTyping[userId];

      return {
        typingMap: {
          ...state.typingMap,
          [chatId]: chatTyping,
        },
      };
    });
  },
}));
