import { useEffect } from "react";
import { usePresenceStore } from "@/stores/presenceStore";
import { useChatStore } from "@/stores/chatStore";
import { presenceWebSocketService } from "@/services/websocket/presenceService";
import { webSocketService } from "@/services/websocket/websocketService";
import {
  PresenceInitEvent,
  PresenceUpdateEvent,
} from "@/shared/types/interfaces/presenceEvent";

export function usePresenceSocketListeners() {
  useEffect(() => {
    const handleInit = (event: PresenceInitEvent) => {
      usePresenceStore.getState().setMultipleStatuses(event.statuses);
    };

    const handleUpdate = (event: PresenceUpdateEvent) => {
      usePresenceStore.getState().setUserStatus(event.userId, event.isOnline);
      if (!event.isOnline && event.lastSeen) {
        usePresenceStore.getState().setLastSeen(event.userId, event.lastSeen);
      }
    };

    const socket = webSocketService.getSocket();
    if (!socket) return; // skip if not connected

    // Subscribe to user IDs first
    const userIds = useChatStore.getState().getAllUserIdsInChats();
    presenceWebSocketService.subscribe(userIds);

    // Set up listeners
    presenceWebSocketService.onInit(handleInit);
    presenceWebSocketService.onUpdate(handleUpdate);

    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return;
      // Clean up listeners
      presenceWebSocketService.removeAllListeners();
      presenceWebSocketService.unsubscribe(userIds);
    };
  }, []);
}
