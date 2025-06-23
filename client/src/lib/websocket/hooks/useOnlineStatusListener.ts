import { useEffect } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { webSocketService } from "@/lib/websocket/services/websocket.service";
import type { ChatResponse } from "@/types/chat";
import { usePresenceStore } from "@/stores/chatPresenceStore";

export function useOnlineStatusListener(chats: ChatResponse[]) {
  console.log("LISTEN FOR ONLINE STATUS");
  const setChatStatus = usePresenceStore((state) => state.setChatStatus);

  useEffect(() => {
    const socket = webSocketService.getSocket();
    if (!socket) return;

    // Handle live status update
    const statusHandler = (payload: {
      userId: string;
      chatId: string;
      isOnline: boolean;
    }) => {
      console.log("statusHandler", payload.chatId, payload.isOnline);
      setChatStatus(payload.chatId, payload.isOnline);
    };

    // Listen for status changes globally
    chatWebSocketService.onStatusChanged(statusHandler);

    // Initial status fetch
    const fetchStatuses = async () => {
      console.log("fetchStatuses fetchStatuses fetchStatuses");
      for (const chat of chats) {
        try {
          const status = await chatWebSocketService.getChatStatus(chat.id);
          if (status) {
            setChatStatus(status.chatId, status.isOnline);
          }
        } catch (err) {
          console.error(`Failed to fetch status for chat ${chat.id}`, err);
        }
      }
    };

    fetchStatuses();

    return () => {
      chatWebSocketService.offStatusChanged(statusHandler);
    };
  }, [chats, setChatStatus]);
}
