import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.socket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/messageResponse";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { toast } from "react-toastify";

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
    const handleMessagesRead = (data: {
      chatId: string; // Add this to match server payload
      memberId: string;
      messageId: string;
    }) => {
      toast.success("Message Read Triggered");
      // No need to get chatId from store, it's in the payload
      useChatMemberStore
        .getState()
        .updateMemberLastRead(data.chatId, data.memberId, data.messageId);
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
