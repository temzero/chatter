import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.socket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/messageResponse";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";

export function useChatSocketListeners() {
  useEffect(() => {
    // Message handler
    const handleNewMessage = (message: MessageResponse) => {
      useMessageStore.getState().addMessage(message);
    };

    const handleTyping = (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      const typingStore = useTypingStore.getState();
      if (data.isTyping) {
        typingStore.startTyping(data.chatId, data.userId);
      } else {
        typingStore.stopTyping(data.chatId, data.userId);
      }
    };

    // New handler for mark as read
    const handleMessagesRead = (data: { memberId: string }) => {
      // Update your store to mark messages as read for this member
      // You may need to get the current chatId from somewhere else, e.g., from a store or context
      const chatId = useChatStore.getState().activeChat?.id;
      if (chatId) {
        useChatMemberStore
          .getState()
          .updateMemberLastRead(chatId, data.memberId);
      }
    };

    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);

    return () => {
      // Clean up listeners
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offTyping(handleTyping);
      chatWebSocketService.offMessagesRead(handleMessagesRead);
    };
  }, []);
}
