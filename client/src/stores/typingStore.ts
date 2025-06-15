import { create } from "zustand";

interface TypingState {
  // Now using an array: chatId -> array of userIds (in order they started typing)
  activeTyping: Record<string, string[]>;

  startTyping: (chatId: string, userId: string) => void;
  stopTyping: (chatId: string, userId: string) => void;
  isTyping: (chatId: string, userId: string) => boolean;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  activeTyping: {},

  startTyping: (chatId, userId) => {
    set((state) => {
      const chatTyping = state.activeTyping[chatId] || [];

      // Remove if already exists, then add to end
      const withoutUser = chatTyping.filter((id) => id !== userId);
      const updatedList = [...withoutUser, userId];

      return {
        activeTyping: {
          ...state.activeTyping,
          [chatId]: updatedList,
        },
      };
    });
  },

  stopTyping: (chatId, userId) => {
    set((state) => {
      const chatTyping = state.activeTyping[chatId];
      if (!chatTyping) return state;

      const updatedList = chatTyping.filter((id) => id !== userId);
      const updatedActiveTyping = { ...state.activeTyping };

      if (updatedList.length > 0) {
        updatedActiveTyping[chatId] = updatedList;
      } else {
        delete updatedActiveTyping[chatId];
      }

      return {
        activeTyping: updatedActiveTyping,
      };
    });
  },

  isTyping: (chatId, userId) => {
    return get().activeTyping[chatId]?.includes(userId) ?? false;
  },
}));
