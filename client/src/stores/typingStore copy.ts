import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { useShallow } from "zustand/react/shallow";
// import { useStoreWithEqualityFn } from "zustand/traditional";

interface TypingState {
  activeTyping: Record<string, string[]>;
  startTyping: (chatId: string, userId: string) => void;
  stopTyping: (chatId: string, userId: string) => void;
  isTyping: (chatId: string, userId: string) => boolean;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  activeTyping: {},

  startTyping: (chatId, userId) => {
    set((state) => {
      const currentTyping = state.activeTyping[chatId] || [];
      // Only update if needed
      if (currentTyping.includes(userId)) return state;

      return {
        activeTyping: {
          ...state.activeTyping,
          [chatId]: [...currentTyping, userId],
        },
      };
    });
  },

  stopTyping: (chatId, userId) => {
    set((state) => {
      const currentTyping = state.activeTyping[chatId];
      if (!currentTyping || !currentTyping.includes(userId)) return state;

      const updated = currentTyping.filter((id) => id !== userId);
      const updatedActiveTyping = { ...state.activeTyping };

      if (updated.length > 0) {
        updatedActiveTyping[chatId] = updated;
      } else {
        delete updatedActiveTyping[chatId];
      }

      return { activeTyping: updatedActiveTyping };
    });
  },

  isTyping: (chatId, userId) => {
    return Boolean(get().activeTyping[chatId]?.includes(userId));
  },
}));

export const useTypingUsers = (chatId: string) => {
  return useTypingStore((state) => state.activeTyping[chatId] || [], shallow);
};

// export const useTypingUsers = (chatId: string) => {
//   return useStoreWithEqualityFn(
//     useTypingStore,
//     (state) => state.activeTyping[chatId] || [],
//     shallow
//   );
// };
