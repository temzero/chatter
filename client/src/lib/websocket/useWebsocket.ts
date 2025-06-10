// src/hooks/useWebSocket.ts
import { useEffect } from "react";
import { webSocketService } from "@/lib/websocket/services/websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/messageResponse";

export const useWebSocket = (activeChatId: string | null) => {
  const { addMessage } = useMessageStore();

  // Initialize WebSocket connection and listeners
  useEffect(() => {
    // Connect to WebSocket server
    webSocketService.connect();
    console.log(
      "Initial connection status:",
      webSocketService.getSocket()?.connected
    );

    // Message handler
    const handleNewMessage = (data: {
      chatId: string;
      message: MessageResponse;
      senderId: string;
    }) => {
      if (data.chatId === activeChatId) {
        addMessage(data.chatId, data.message);
      }
    };

    // Register listener
    webSocketService.onNewMessage(handleNewMessage);

    // Cleanup on unmount
    return () => {
      webSocketService.offNewMessage(handleNewMessage);
      webSocketService.disconnect();
    };
  }, [activeChatId, addMessage]);

  // Handle chat room joining/leaving
  useEffect(() => {
    if (!activeChatId) return;

    webSocketService.joinChat(activeChatId);

    return () => {
      webSocketService.leaveChat(activeChatId);
    };
  }, [activeChatId]);
};
