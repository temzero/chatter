// hooks/useChatOnlineStatus.ts
import { useEffect, useState } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";
import { webSocketService } from "@/lib/websocket/services/websocket.service";

export const useChatOnlineStatus = (chatId?: string) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const socket = webSocketService.getSocket();
    // console.log("chatId:", chatId, "socket:", socket);

    // Check status and set up listeners
    const checkStatus = async () => {
      try {
        const response = await chatWebSocketService.getChatStatus(chatId);
        if (response?.chatId === chatId) {
          setIsOnline(response.isOnline);
          // console.log("Status response:", response);
        }
      } catch (error) {
        console.error("Error getting chat status:", error);
      }
    };

    const statusHandler = (payload: { chatId: string; isOnline: boolean }) => {
      if (payload.chatId === chatId) {
        setIsOnline(payload.isOnline);
        // console.log("Status update - isOnline:", payload.isOnline);
      }
    };

    // Set up initial connection and listeners
    if (socket?.connected) {
      checkStatus();
    } else {
      const onConnect = () => {
        checkStatus();
        socket?.off("connect", onConnect);
      };
      socket?.on("connect", onConnect);
    }

    // Listen for status changes
    socket?.on("statusChanged", statusHandler);

    return () => {
      // Clean up listeners
      socket?.off("statusChanged", statusHandler);
      socket?.off("connect", checkStatus);
    };
  }, [chatId]);

  return isOnline;
};
