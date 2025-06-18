// stores/presenceStore.ts
import { create } from "zustand";

interface PresenceState {
  userOnlineMap: Record<string, boolean>; // UserIds - boolean
  setOnlineStatus: (userId: string, isOnline: boolean) => void;
  isUserOnline: (userId: string) => boolean;
  isChatOnline: (chatMemberIds: string[], currentUserId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  userOnlineMap: {},

  setOnlineStatus: (userId, isOnline) =>
    set((state) => ({
      userOnlineMap: {
        ...state.userOnlineMap,
        [userId]: isOnline,
      },
    })),

  isUserOnline: (userId) => get().userOnlineMap[userId] ?? false,

  isChatOnline: (chatMemberIds, currentUserId) =>
    chatMemberIds.some((id) => id !== currentUserId && get().userOnlineMap[id]),
}));
