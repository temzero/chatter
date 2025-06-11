// hooks/useChatSocketListeners.ts
import { useEffect } from "react";
import { chatWebSocketService } from "./services/chat.socket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/messageResponse";

export function useChatSocketListeners() {
  useEffect(() => {
    console.log("[WS] ✅ useChatSocketListeners hook is running");
    const handleNewMessage = (message: MessageResponse) => {
      console.log("[WS] 📩 New message received:", message);
      useMessageStore.getState().addMessage(message);
    };

    chatWebSocketService.onNewMessage(handleNewMessage);
    console.log("[WS] ✅ Subscribed to new message listener");

    return () => {
      chatWebSocketService.offNewMessage(handleNewMessage);
      console.log("[WS] ❌ Unsubscribed from new message listener");
    };
  }, []);
}
