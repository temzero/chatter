import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/messageResponse";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { toast } from "react-toastify";

export function useChatSocketListeners() {
  useEffect(() => {
    // Message handler
    const handleNewMessage = (message: MessageResponse) => {
      toast.success(`New message received: ${message}`);
      console.log(`New message received: ${message}`);
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
      chatId: string;
      memberId: string;
      messageId: string;
    }) => {
      useChatMemberStore
        .getState()
        .updateMemberLastRead(data.chatId, data.memberId, data.messageId);
    };

    const handleReaction = (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => {
      useMessageStore
        .getState()
        .updateMessageReactions(data.messageId, data.reactions);
    };

    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onReaction(handleReaction);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);

    return () => {
      // Clean up listeners
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offReaction(handleReaction);
      chatWebSocketService.offTyping(handleTyping);
      chatWebSocketService.offMessagesRead(handleMessagesRead);
    };
  }, []);
}
