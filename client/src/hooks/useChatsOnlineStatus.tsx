import { useEffect, useState } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { webSocketService } from "@/lib/websocket/services/websocket.service";
import type { ChatResponse } from "@/types/responses/chat.response";

type OnlineStatus = Record<string, boolean>;

export function useChatsOnlineStatus(chats: ChatResponse[]): OnlineStatus {
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});

  useEffect(() => {
    const socket = webSocketService.getSocket();
    if (!socket) return;

    // Handle live status update
    const statusHandler = (payload: {
      userId: string;
      chatId: string;
      isOnline: boolean;
    }) => {
      setOnlineStatus((prev) => ({
        ...prev,
        [payload.chatId]: payload.isOnline,
      }));
    };

    // Listen for status changes globally
    chatWebSocketService.onStatusChanged(statusHandler);

    // Initial status fetch
    const fetchStatuses = async () => {
      for (const chat of chats) {
        try {
          const status = await chatWebSocketService.getChatStatus(chat.id);
          if (status) {
            setOnlineStatus((prev) => ({
              ...prev,
              [status.chatId]: status.isOnline,
            }));
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
  }, [chats]);

  return onlineStatus;
}
