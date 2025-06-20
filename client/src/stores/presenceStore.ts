// stores/presenceUsersStore.ts
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { webSocketService } from "@/lib/websocket/services/websocket.service";
import { useCurrentUserId } from "./authStore";
import { ChatType } from "@/types/enums/ChatType";
import { useMemo } from "react";
import { useChatMemberStore } from "./chatMemberStore";

interface PresenceStore {
  onlineUsers: string[];
  setUserStatus: (userId: string, isOnline: boolean) => void;
  setMultipleStatuses: (statuses: Record<string, boolean>) => void;
  initialize: () => () => void; // Initialize function with cleanup
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
      // console.log("⬅️ Previous onlineUsers:", state.onlineUsers);

      const prevOnlineSet = new Set(state.onlineUsers);
      const newOnlineSet = new Set<string>();

      Object.entries(statuses).forEach(([userId, isOnline]) => {
        if (isOnline) {
          newOnlineSet.add(userId);
        }
      });

      // Determine who went offline
      const loggedOutUsers: string[] = [];
      prevOnlineSet.forEach((userId) => {
        if (!newOnlineSet.has(userId)) {
          loggedOutUsers.push(userId);
        }
      });

      if (loggedOutUsers.length > 0) {
        console.log("🔻 Logged out users:", loggedOutUsers);
      }

      const updatedOnlineUsers = Array.from(newOnlineSet);
      // console.log("✅ Updated onlineUsers:", updatedOnlineUsers);

      return { onlineUsers: updatedOnlineUsers };
    }),

  initialize: () => {
    const socket = webSocketService.getSocket();
    if (!socket) return () => {}; // Return empty cleanup if no socket

    // Get user IDs from chat store
    const userIds = useChatMemberStore.getState().getAllUserIdsInChats();
    // console.log("userIds: ", userIds);
    socket.emit("presence:subscribe", userIds);

    // Handlers
    const handleInitialPresence = (statuses: Record<string, boolean>) => {
      usePresenceUserStore.getState().setMultipleStatuses(statuses);
    };

    const handlePresenceUpdate = (userId: string, isOnline: boolean) => {
      usePresenceUserStore.getState().setUserStatus(userId, isOnline);
    };

    // Set up listeners
    socket.on("presence:init", handleInitialPresence);
    socket.on("presence:update", handlePresenceUpdate);

    // Return cleanup function
    return () => {
      socket.off("presence:init", handleInitialPresence);
      socket.off("presence:update", handlePresenceUpdate);
    };
  },
}));

export const useUserStatus = (userId: string) => {
  return usePresenceUserStore(
    useShallow((state) => state.onlineUsers.includes(userId))
  );
};

export const useChatStatus = (chatId: string, type: ChatType) => {
  console.log("useChatStatus", type);
  const currentUserId = useCurrentUserId();
  const getChatMemberUserIds = useChatMemberStore(
    (state) => state.getChatMemberUserIds
  );

  const memberIds = useMemo(() => {
    const raw = getChatMemberUserIds(chatId, type);
    return raw.filter((id) => id !== currentUserId);
  }, [chatId, type, getChatMemberUserIds, currentUserId]);

  // console.log("useChatStatus memberIds", memberIds);

  return usePresenceUserStore(
    useShallow((state) =>
      memberIds.some((id) => state.onlineUsers.includes(id))
    )
  );
};
