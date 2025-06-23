// hooks/useChatOnlineStatus.ts
import { useEffect, useState } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { webSocketService } from "@/lib/websocket/services/websocket.service";

export const useChatOnlineStatus = (chatId?: string) => {
  console.log("useChatOnlineStatus", chatId);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const socket = webSocketService.getSocket();

    const checkStatus = async () => {
      try {
        const response = await chatWebSocketService.getChatStatus(chatId);
        if (response?.chatId === chatId) {
          setIsOnline(response.isOnline);
        }
      } catch (error) {
        console.error("Error getting chat status:", error);
      }
    };

    const statusHandler = (payload: { chatId: string; isOnline: boolean }) => {
      if (payload.chatId === chatId) {
        setIsOnline(payload.isOnline);
        console.log("Status update - isOnline:", payload.isOnline);
      }
    };

    if (socket?.connected) {
      checkStatus();
    } else {
      const onConnect = () => {
        checkStatus();
        socket?.off("connect", onConnect); // remove listener after one-time use
      };
      socket?.on("connect", onConnect);
    }

    // ✅ Use the service layer abstraction (correct way)
    chatWebSocketService.onStatusChanged(statusHandler);

    return () => {
      chatWebSocketService.offStatusChanged(statusHandler);
      socket?.off("connect", checkStatus);
    };
  }, [chatId]);

  return isOnline;
};
