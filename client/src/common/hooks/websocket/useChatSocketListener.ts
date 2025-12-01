import { useEffect } from "react";
import { toast } from "react-toastify";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { audioService, SoundType } from "@/services/audioService";
import { handleSystemEventMessage } from "@/common/utils/message/handleSystemEventMessage";
import { WsNotificationResponse } from "@/shared/types/responses/ws-emit-chat-member.response";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { webSocketService } from "@/services/websocket/websocketService";
import { handleError } from "@/common/utils/error/handleError";
import { useTranslation } from "react-i18next";

export function useChatSocketListeners() {
  const { t } = useTranslation();
  useEffect(() => {
    // ======== Message Handlers ========
    const handleNewMessage = async (
      data: WsNotificationResponse<MessageResponse>
    ) => {
      const { payload: message, meta } = data;
      console.log("[EVENT]", "Received new message via WebSocket:", message);

      const messageStore = useMessageStore.getState();

      const isMuted = meta?.isMuted ?? false;
      const isOwnMessage = meta?.isSender ?? false;
      const existingMessage = messageStore.getMessageById(message.id);
      try {
        await useChatStore.getState().getOrFetchChatById(message.chatId, {
          fetchFullData: true,
        });
      } catch (error) {
        console.error("Failed to fetch chat for incoming message:", error);
        return;
      }

      if (isOwnMessage && existingMessage) {
        messageStore.updateMessageById(message.id, {
          status: MessageStatus.SENT,
        });
        return;
      }

      if (message.systemEvent) {
        handleSystemEventMessage(message);
      }

      if (!existingMessage) {
        messageStore.addMessage(message);
      }

      // if (!isMuted && chatStore.activeChatId !== message.chatId) {
      if (!isMuted && !message.call) {
        audioService.playSound(SoundType.NEW_MESSAGE);
      }
    };

    const handleMessageSaved = (
      data: WsNotificationResponse<MessageResponse>
    ) => {
      try {
        const { payload: message } = data;
        useMessageStore.getState().addMessage(message);
        toast.success(t("toast.message.saved"));
      } catch (error) {
        handleError(error, "Failed to save message");
      }
    };

    // ======== Typing ========
    const handleTyping = (
      data: WsNotificationResponse<{
        chatId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => {
      try {
        const { payload } = data;
        const typingStore = useTypingStore.getState();
        if (payload.isTyping) {
          typingStore.startTyping(payload.chatId, payload.userId);
        } else {
          typingStore.stopTyping(payload.chatId, payload.userId);
        }
      } catch (error) {
        handleError(error, "Typing failed");
      }
    };

    // ======== Mark as read ========
    const handleMessagesRead = (
      data: WsNotificationResponse<{
        chatId: string;
        memberId: string;
        messageId: string;
      }>
    ) => {
      try {
        const { payload } = data;
        useChatMemberStore
          .getState()
          .updateMemberLastRead(
            payload.chatId,
            payload.memberId,
            payload.messageId
          );
      } catch (error) {
        handleError(error, "Failed update reading");
      }
    };

    // ======== Reactions ========
    const handleReaction = (
      data: WsNotificationResponse<{
        messageId: string;
        reactions: { [emoji: string]: string[] };
      }>
    ) => {
      try {
        const { payload } = data;
        useMessageStore
          .getState()
          .updateMessageReactions(payload.messageId, payload.reactions);
      } catch (error) {
        handleError(error, "Reaction failed");
      }
    };

    // ======== Pin ========
    const handleMessagePinned = (
      data: WsNotificationResponse<{
        chatId: string;
        message: MessageResponse | null;
      }>
    ) => {
      try {
        const { payload } = data;
        const { chatId, message } = payload;
        if (!chatId || !message) return null;

        const isPinned = message.isPinned;

        // 1. Update pinnedMessage in chat store
        useChatStore
          .getState()
          .setPinnedMessage(chatId, isPinned ? message : null);

        // 2. Unpin all messages in the chat
        const allMessages = useMessageStore.getState().getChatMessages(chatId);
        allMessages.forEach((msg) => {
          if (msg.isPinned && msg.id !== message.id) {
            useMessageStore.getState().updateMessageById(msg.id, {
              isPinned: false,
            });
          }
        });

        // 3. Update the target message
        useMessageStore.getState().updateMessageById(message.id, {
          isPinned,
        });
      } catch (error) {
        handleError(error, "Error handling pinned message");
      }
    };

    // ======== Important ========
    const handleMessageMarkedImportant = (
      data: WsNotificationResponse<{
        chatId: string;
        messageId: string;
        isImportant: boolean;
      }>
    ) => {
      try {
        const { payload: update } = data;
        console.log("[EVENT]", "isImportant", update.isImportant);
        useMessageStore.getState().updateMessageById(update.messageId, {
          isImportant: update.isImportant,
        });
      } catch (error) {
        handleError(error, "Mark important failed");
      }
    };

    // ======== Delete ========
    const handleMessageDeleted = (
      data: WsNotificationResponse<{ chatId: string; messageId: string }>
    ) => {
      try {
        const { payload } = data;
        useMessageStore
          .getState()
          .deleteMessage(payload.chatId, payload.messageId);
      } catch (error) {
        handleError(error, "Can not delete message");
      }
    };

    // ======== Error ========
    const handleMessageError = (
      data: WsNotificationResponse<{
        chatId: string;
        messageId: string;
        error: string;
        code?: string;
      }>
    ) => {
      try {
        const { payload: error } = data;

        // FIX: Check if the entire error payload is undefined
        if (!error) {
          console.error(
            "WebSocket error payload is completely undefined:",
            data
          );
          return;
        }

        // Then check if messageId exists
        if (!error.messageId) {
          console.error("Message ID is undefined in error response:", error);
          return;
        }

        useMessageStore.getState().updateMessageById(error.messageId, {
          status: MessageStatus.FAILED,
        });

        toast.error(t("toast.message.error"));
      } catch (error) {
        handleError(error, "Error failed!");
      }
    };

    // ======== Subscribe ========
    const socket = webSocketService.getSocket();
    if (!socket) return;

    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onSaveMessage(handleMessageSaved);
    chatWebSocketService.onReaction(handleReaction);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);
    chatWebSocketService.onMessagePin(handleMessagePinned);
    chatWebSocketService.onImportantMessage(handleMessageMarkedImportant);
    chatWebSocketService.onDeleteMessage(handleMessageDeleted);
    chatWebSocketService.onMessageError(handleMessageError);

    // ======== Cleanup ========
    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return;
      chatWebSocketService.removeAllListeners();
    };
  }, [t]);
}
