// hooks/usePresenceSocketListeners.ts
import { useEffect } from "react";
import { webSocketService } from "../services/websocket.service";
import { usePresenceUserStore } from "@/stores/presenceStore";
import { useChatStore } from "@/stores/chatStore";

export function usePresenceSocketListeners() {
  useEffect(() => {
    const socket = webSocketService.getSocket();
    console.log("usePresenceSocketListeners socket", socket);

    if (!socket) return;

    // Get all user IDs from chats (direct partners + group members)
    const userIds = useChatStore.getState().getAllUserIdsInChats();
    console.log("usePresenceSocketListeners userIds", userIds);

    // Subscribe to presence updates for these users
    socket.emit("presence:subscribe", userIds);

    // Handle initial presence statuses
    const handleInitialPresence = (statuses: Record<string, boolean>) => {
      usePresenceUserStore.getState().setMultipleStatuses(statuses);
    };

    // Handle real-time presence updates
    const handlePresenceUpdate = (userId: string, isOnline: boolean) => {
      usePresenceUserStore.getState().setUserStatus(userId, isOnline);
    };

    // Set up listeners
    socket.on("presence:init", handleInitialPresence);
    socket.on("presence:update", handlePresenceUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off("presence:init", handleInitialPresence);
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, []); // Runs once on component mount
}
