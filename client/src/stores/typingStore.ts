import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface TypingStoreState {
  activeTyping: Record<string, string[]>; // chatId - UserId[]
}

interface TypingStoreActions {
  startTyping: (chatId: string, userId: string) => void;
  stopTyping: (chatId: string, userId: string) => void;
  isTyping: (chatId: string, userId: string) => boolean;
}

const initialState: TypingStoreState = {
  activeTyping: {},
};

export const useTypingStore = create<TypingStoreState & TypingStoreActions>(
  (set, get) => ({
    ...initialState,

    startTyping: (chatId, userId) => {
      set((state) => {
        const currentTyping = state.activeTyping[chatId] || [];
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
  })
);

// EXPORT HOOKS

export const useTypingUsersByChatId = (chatId: string) => {
  return useTypingStore(
    useShallow((state) => state.activeTyping[chatId] || [])
  );
};
