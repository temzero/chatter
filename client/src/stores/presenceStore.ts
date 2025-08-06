import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMemo } from "react";
import { useCurrentUserId } from "./authStore";
import { ChatType } from "@/types/enums/ChatType";
import { useChatMemberStore } from "./chatMemberStore";

interface PresenceStore {
  onlineUserIds: string[];
  lastSeenMap: Record<string, string>; // userId → ISO timestamp
  setUserStatus: (userId: string, isOnline: boolean, lastSeen?: string) => void;
  setMultipleStatuses: (statuses: Record<string, boolean>) => void;
  setLastSeen: (userId: string, timestamp: string) => void;
  getLastSeen: (userId: string) => string | undefined;
}

export const usePresenceStore = create<PresenceStore>((set, get) => ({
  onlineUserIds: [],
  lastSeenMap: {},

  setUserStatus: (userId, isOnline, lastSeen) =>
    set((state) => {
      const exists = state.onlineUserIds.includes(userId);

      // Update online status
      let onlineUserIds = state.onlineUserIds;
      if (isOnline && !exists) {
        onlineUserIds = [...state.onlineUserIds, userId];
      } else if (!isOnline && exists) {
        onlineUserIds = state.onlineUserIds.filter((id) => id !== userId);
      }

      // Update last seen if provided
      const lastSeenMap = lastSeen
        ? { ...state.lastSeenMap, [userId]: lastSeen }
        : state.lastSeenMap;

      return { onlineUserIds, lastSeenMap };
    }),

  setMultipleStatuses: (statuses) =>
    set((state) => {
      const onlineUserIds = Object.entries(statuses)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, isOnline]) => isOnline)
        .map(([userId]) => userId);

      // Preserve existing lastSeen data
      return { onlineUserIds, lastSeenMap: state.lastSeenMap };
    }),

  setLastSeen: (userId, timestamp) =>
    set((state) => ({
      lastSeenMap: { ...state.lastSeenMap, [userId]: timestamp },
    })),

  getLastSeen: (userId) => get().lastSeenMap[userId],
}));

// Existing hooks remain the same, but we'll add new ones:
export const useUserStatus = (userId?: string) => {
  return usePresenceStore(
    useShallow((state) =>
      userId ? state.onlineUserIds.includes(userId) : false
    )
  );
};

export const useUserLastSeen = (userId?: string) => {
  return usePresenceStore(
    useShallow((state) => (userId ? state.lastSeenMap[userId] : undefined))
  );
};

export const useChatStatus = (chatId: string, type: ChatType) => {
  const currentUserId = useCurrentUserId();
  const getChatMemberUserIds = useChatMemberStore(
    (state) => state.getChatMemberUserIds
  );

  const memberIds = useMemo(() => {
    const raw = getChatMemberUserIds(chatId, type);
    return raw.filter((id) => id !== currentUserId);
  }, [chatId, type, getChatMemberUserIds, currentUserId]);

  return usePresenceStore(
    useShallow((state) =>
      memberIds.some((id) => state.onlineUserIds.includes(id))
    )
  );
};
