import { create } from "zustand";

interface TypingState {
  // Only stores active typers - if user exists in the set, they're typing
  activeTyping: Record<string, Set<string>>; // chatId -> Set of userIds

  startTyping: (chatId: string, userId: string) => void;
  stopTyping: (chatId: string, userId: string) => void;
  isTyping: (chatId: string, userId: string) => boolean;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  activeTyping: {},

  startTyping: (chatId, userId) => {
    set((state) => {
      const chatTyping = state.activeTyping[chatId] || new Set();
      return {
        activeTyping: {
          ...state.activeTyping,
          [chatId]: new Set(chatTyping).add(userId),
        },
      };
    });
  },

  stopTyping: (chatId, userId) => {
    set((state) => {
      const chatTyping = state.activeTyping[chatId];
      if (!chatTyping) return state;

      const newTypingUsers = new Set(chatTyping);
      newTypingUsers.delete(userId);

      // Create a shallow copy of activeTyping
      const updatedActiveTyping = { ...state.activeTyping };

      if (newTypingUsers.size > 0) {
        updatedActiveTyping[chatId] = newTypingUsers;
      } else {
        delete updatedActiveTyping[chatId];
      }

      return {
        activeTyping: updatedActiveTyping,
      };
    });
  },

  isTyping: (chatId, userId) => {
    return Boolean(get().activeTyping[chatId]?.has(userId));
  },
}));
