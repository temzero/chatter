import { useEffect } from "react";
import { usePresenceStore } from "@/stores/presenceStore";
import { useChatStore } from "@/stores/chatStore";
import { presenceWebSocketService } from "../services/presence.service";
import {
  PresenceInitEvent,
  PresenceUpdateEvent,
} from "../constants/present-payload.type";
import { webSocketService } from "../services/websocket.service";

export function usePresenceSocketListeners() {
  useEffect(() => {
    const userIds = useChatStore.getState().getAllUserIdsInChats();
    presenceWebSocketService.subscribe(userIds);

    const handleInit = (event: PresenceInitEvent) => {
      usePresenceStore.getState().setMultipleStatuses(event.statuses);
    };

    const handleUpdate = (event: PresenceUpdateEvent) => {
      usePresenceStore.getState().setUserStatus(event.userId, event.isOnline);
      if (!event.isOnline && event.lastSeen) {
        usePresenceStore.getState().setLastSeen(event.userId, event.lastSeen);
      }
    };

    const cleanupInit = presenceWebSocketService.onInit(handleInit);
    const cleanupUpdate = presenceWebSocketService.onUpdate(handleUpdate);

    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return; // skip if not connected
      cleanupInit();
      cleanupUpdate();
      presenceWebSocketService.unsubscribe(userIds);
    };
  }, []);
}
