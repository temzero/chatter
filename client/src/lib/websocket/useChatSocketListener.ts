import { useEffect } from "react";
import { chatWebSocketService } from "./services/chat.socket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/messageResponse";
import { useTypingStore } from "@/stores/typingStore";

export function useChatSocketListeners() {
  useEffect(() => {
    // Message handler
    const handleNewMessage = (message: MessageResponse) => {
      // console.log("[WS] 📩 New message received:", message);
      useMessageStore.getState().addMessage(message);
    };

    const handleTyping = (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      // console.log(
      //   `[WS] 🖊️ User ${data.userId} ${
      //     data.isTyping ? "started" : "stopped"
      //   } typing in chat ${data.chatId}`
      // );

      const typingStore = useTypingStore.getState();
      if (data.isTyping) {
        typingStore.startTyping(data.chatId, data.userId);
      } else {
        typingStore.stopTyping(data.chatId, data.userId);
      }
    };

    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onTyping(handleTyping);
    // console.log("[WS] ✅ Subscribed to new message & typing listeners");

    return () => {
      // Clean up listeners
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offTyping(handleTyping);
      // console.log("[WS] ❌ Unsubscribed from listeners");
    };
  }, []);
}
