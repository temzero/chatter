// hooks/useChatOnlineStatus.ts
import { useEffect, useState } from "react";
import { webSocketService } from "@/lib/websocket/websocketService";

const chatGateway = "chat";

export const useChatOnlineStatus = (chatId?: string) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const socket = webSocketService.getSocket();

    // Initial status check
    socket?.emit(
      `${chatGateway}:getStatus`,
      chatId,
      (response: { chatId: string; isOnline: boolean }) => {
        if (response.chatId === chatId) {
          setIsOnline(response.isOnline);
        }
      }
    );

    // Listen for status changes
    const statusHandler = (payload: { chatId: string; isOnline: boolean }) => {
      if (payload.chatId === chatId) {
        setIsOnline(payload.isOnline);
        console.log('Status updated:', payload); 
      }
    };

    socket?.on("chat:statusChanged", statusHandler);

    return () => {
      socket?.off("chat:statusChanged", statusHandler);
    };
  }, [chatId]);

  return isOnline;
};
