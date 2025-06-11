import { useEffect, useState } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";
import { webSocketService } from "@/lib/websocket/services/websocket.service";
import type { ChatResponse } from "@/types/chat";

type OnlineStatus = Record<string, boolean>;

export function useChatsOnlineStatus(chats: ChatResponse[]): OnlineStatus {
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>({});

  useEffect(() => {
    const socket = webSocketService.getSocket();
    if (!socket) return;

    const statusHandler = (payload: { chatId: string; isOnline: boolean }) => {
      setOnlineStatus((prev) => ({
        ...prev,
        [payload.chatId]: payload.isOnline,
      }));
    };

    socket.on("statusChanged", statusHandler);

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
      socket.off("statusChanged", statusHandler);
    };
  }, [chats]);

  return onlineStatus;
}
