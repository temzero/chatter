import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";
// import { toast } from "react-toastify";

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
      console.log("reactions return", data.reactions);
      useMessageStore
        .getState()
        .updateMessageReactions(data.messageId, data.reactions);
    };

    const handleMessagePinned = (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => {
      useChatStore.getState().setPinnedMessage(data.chatId, data.message);
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      chatId: string;
    }) => {
      useMessageStore.getState().deleteMessage(data.chatId, data.messageId);
    };

    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onReaction(handleReaction);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);
    chatWebSocketService.onMessagePin(handleMessagePinned);
    chatWebSocketService.onDeleteMessage(handleMessageDeleted);

    return () => {
      // Clean up listeners
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offReaction(handleReaction);
      chatWebSocketService.offTyping(handleTyping);
      chatWebSocketService.offMessagesRead(handleMessagesRead);
      chatWebSocketService.offMessagePin(handleMessagePinned);
      chatWebSocketService.offDeleteMessage(handleMessageDeleted);
    };
  }, []);
}
