import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { MessageStatus } from "@/types/enums/message";
// import { toast } from "react-toastify";

export function useChatSocketListeners() {
  useEffect(() => {
    const handleNewMessage = (message: MessageResponse) => {
      const currentUserId = useAuthStore.getState().currentUser?.id;

      if (
        message.sender.id === currentUserId &&
        useMessageStore.getState().getMessageById(message.id)
      ) {
        // It's my message and already exists → update it with server-confirmed data
        useMessageStore
          .getState()
          .updateMessageById(message.chatId, message.id, message);
      } else {
        // Not my message or not found → add to store
        useMessageStore.getState().addMessage(message);
      }
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

    const handleMessageError = (error: {
      messageId: string;
      chatId: string;
      error: string;
      code?: string;
    }) => {
      // Update specific message state
      useMessageStore
        .getState()
        .updateMessageById(error.chatId, error.messageId, {
          status: MessageStatus.FAILED,
        });

      // Show contextual error
      // toast.error(`Message failed: ${error.error}`);
    };

    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onReaction(handleReaction);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);
    chatWebSocketService.onMessagePin(handleMessagePinned);
    chatWebSocketService.onDeleteMessage(handleMessageDeleted);
    chatWebSocketService.onMessageError(handleMessageError);

    return () => {
      // Clean up listeners
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offReaction(handleReaction);
      chatWebSocketService.offTyping(handleTyping);
      chatWebSocketService.offMessagesRead(handleMessagesRead);
      chatWebSocketService.offMessagePin(handleMessagePinned);
      chatWebSocketService.offDeleteMessage(handleMessageDeleted);
      chatWebSocketService.offMessageError(handleMessageError);
    };
  }, []);
}
