import { create } from "zustand";
import { useShallow } from "zustand/react/shallow"; // Updated import path

interface PresenceStore {
  onlineUsers: string[];
  setUserStatus: (userId: string, isOnline: boolean) => void;
  setMultipleStatuses: (statuses: Record<string, boolean>) => void;
}

export const usePresenceUserStore = create<PresenceStore>((set) => ({
  onlineUsers: [],
  setUserStatus: (userId, isOnline) =>
    set((state) => {
      const exists = state.onlineUsers.includes(userId);
      if (isOnline && !exists) {
        return { onlineUsers: [...state.onlineUsers, userId] };
      }
      if (!isOnline && exists) {
        return { onlineUsers: state.onlineUsers.filter((id) => id !== userId) };
      }
      return state;
    }),
  setMultipleStatuses: (statuses) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      
      Object.entries(statuses).forEach(([userId, isOnline]) => {
        if (isOnline) {
          newOnlineUsers.add(userId);
        } else {
          newOnlineUsers.delete(userId);
        }
      });

      // Only update if there are actual changes
      if (newOnlineUsers.size !== state.onlineUsers.length || 
          !state.onlineUsers.every(id => newOnlineUsers.has(id))) {
        return { onlineUsers: Array.from(newOnlineUsers) };
      }
      return state;
    }),
}));

export const useUserStatus = (userId: string) => {
  return usePresenceUserStore(
    useShallow((state) => state.onlineUsers.includes(userId))
  );
};