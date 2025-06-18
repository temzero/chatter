import { create } from "zustand";
import { useShallow } from "zustand/shallow";

interface PresenceStore {
  onlineChats: string[]; // Array of chat IDs that are currently online
  setChatStatus: (chatId: string, isOnline: boolean) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  onlineChats: [],
  setChatStatus: (chatId, isOnline) =>
    set((state) => {
      // If chat is coming online and not already in the array
      if (isOnline && !state.onlineChats.includes(chatId)) {
        return { onlineChats: [...state.onlineChats, chatId] };
      }
      // If chat is going offline and is in the array
      if (!isOnline && state.onlineChats.includes(chatId)) {
        return { onlineChats: state.onlineChats.filter((id) => id !== chatId) };
      }
      // No changes needed
      return state;
    }),
}));

export const useChatStatus = (chatId: string) => {
  return usePresenceStore(
    useShallow((state) => state.onlineChats.includes(chatId))
  );
};
