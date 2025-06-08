// hooks/useGroupOnlineStatus.ts
import { useEffect, useState } from "react";
import { webSocketService } from "@/lib/websocket/websocketService";

export const useGroupOnlineStatus = (chatId?: string) => {
  const [hasOnline, setHasOnline] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const socket = webSocketService.getSocket();

    // Request current online status of group
    socket?.emit(
      "check-online",
      chatId,
      (hasOnline: boolean) => {
        setHasOnline(hasOnline);
      }
    );

    // Optional: Listen for real-time updates (requires backend support)
    const updateHandler = (payload: { chatId: string; hasOnline: boolean }) => {
      if (payload.chatId === chatId) {
        setHasOnline(payload.hasOnline);
      }
    };

    socket?.on("chatroom:update", updateHandler);

    return () => {
      socket?.off("chatroom:update", updateHandler);
    };
  }, [chatId]);

  return hasOnline;
};
