// src/services/websocket/chat.service.ts
import { ChatEvent } from "@/shared/types/enums/websocket-events.enum";
import { webSocketService } from "@/services/websocket/websocketService";
import { CreateMessageRequest } from "@/shared/types/requests/send-message.request";
import { ForwardMessageRequest } from "@/shared/types/requests/forward-message.request";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { WsNotificationResponse } from "@/shared/types/responses/ws-emit-chat-member.response";
import {
  decryptMessage,
  encryptMessage,
} from "../encryption/message-encryption.service";

export const chatWebSocketService = {
  async getChatStatus(chatId: string) {
    return new Promise<{ chatId: string; isOnline: boolean }>((resolve) => {
      webSocketService.emit(
        ChatEvent.GET_STATUS,
        chatId,
        (response: unknown) => {
          resolve(response as { chatId: string; isOnline: boolean });
        }
      );
    });
  },

  onStatusChanged(
    callback: (data: {
      userId: string;
      chatId: string;
      isOnline: boolean;
    }) => void
  ) {
    webSocketService.on(ChatEvent.STATUS_CHANGED, callback);
  },

  offStatusChanged(
    callback: (data: {
      userId: string;
      chatId: string;
      isOnline: boolean;
    }) => void
  ) {
    webSocketService.off(ChatEvent.STATUS_CHANGED, callback);
  },

  typing(chatId: string, isTyping: boolean) {
    webSocketService.emit(ChatEvent.TYPING, { chatId, isTyping });
  },

  sendMessage(message: CreateMessageRequest) {
    webSocketService.emit(ChatEvent.SEND_MESSAGE, message);
  },

  async e2eeSendMessage(message: CreateMessageRequest) {
    try {
      const encrypted = await encryptMessage(message.chatId, message);
      webSocketService.emit(ChatEvent.SEND_MESSAGE, encrypted);
    } catch (error) {
      console.log("No encryption key, sending plain message:", error);
      webSocketService.emit(ChatEvent.SEND_MESSAGE, message);
    }
  },

  forwardMessage(message: ForwardMessageRequest) {
    webSocketService.emit(ChatEvent.FORWARD_MESSAGE, message);
  },

  messageRead(chatId: string, memberId: string, messageId: string) {
    webSocketService.emit(ChatEvent.MESSAGE_READ, {
      chatId,
      memberId,
      messageId,
    });
  },

  reactToMessage(payload: {
    messageId: string;
    chatId: string;
    emoji: string;
  }) {
    webSocketService.emit(ChatEvent.REACT_TO_MESSAGE, payload);
  },

  togglePinMessage(payload: { chatId: string; messageId: string | null }) {
    webSocketService.emit(ChatEvent.TOGGLE_PIN_MESSAGE, payload);
  },

  saveMessage(payload: { messageId: string | null }) {
    webSocketService.emit(ChatEvent.SAVE_MESSAGE, payload);
  },

  toggleImportantMessage(payload: {
    messageId: string;
    chatId: string;
    isImportant: boolean;
  }) {
    webSocketService.emit(ChatEvent.TOGGLE_IMPORTANT, payload);
  },

  deleteMessage(payload: {
    messageId: string;
    chatId: string;
    isDeleteForEveryone: boolean;
  }) {
    webSocketService.emit(ChatEvent.DELETE_MESSAGE, payload);
  },

  // ======= On handlers using WsNotificationResponse =======

  onNewMessage(
    callback: (wsData: WsNotificationResponse<MessageResponse>) => void
  ) {
    webSocketService.on(ChatEvent.NEW_MESSAGE, callback);
  },

  onE2eeNewMessage(
    callback: (wsData: WsNotificationResponse<MessageResponse>) => void
  ) {
    webSocketService.on(ChatEvent.NEW_MESSAGE, async (wsData: unknown) => {
      try {
        // Cast to the expected type
        const typedData = wsData as WsNotificationResponse<MessageResponse>;

        const decrypted = await decryptMessage(
          typedData.payload.chatId,
          typedData.payload
        );

        callback({
          ...typedData,
          payload: decrypted,
        });
      } catch (error) {
        console.log("Could not decrypt, sending as-is:", error);
        callback(wsData as WsNotificationResponse<MessageResponse>);
      }
    });
  },
  
  offNewMessage(
    callback: (wsData: WsNotificationResponse<MessageResponse>) => void
  ) {
    webSocketService.off(ChatEvent.NEW_MESSAGE, callback);
  },

  onMessageUpdate(
    callback: (wsData: WsNotificationResponse<MessageResponse>) => void
  ) {
    webSocketService.on(ChatEvent.UPDATE_MESSAGE, callback);
  },
  offMessageUpdate(
    callback?: (wsData: WsNotificationResponse<MessageResponse>) => void
  ) {
    if (callback) webSocketService.off(ChatEvent.UPDATE_MESSAGE, callback);
    else webSocketService.off(ChatEvent.UPDATE_MESSAGE);
  },

  onTyping(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => void
  ) {
    webSocketService.on(ChatEvent.USER_TYPING, callback);
  },
  offTyping(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => void
  ) {
    webSocketService.off(ChatEvent.USER_TYPING, callback);
  },

  onMessagesRead(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        memberId: string;
        messageId: string;
      }>
    ) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_READ, callback);
  },
  offMessagesRead(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        memberId: string;
        messageId: string;
      }>
    ) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_READ, callback);
  },

  onReaction(
    callback: (
      wsData: WsNotificationResponse<{
        messageId: string;
        reactions: { [emoji: string]: string[] };
      }>
    ) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_REACTION, callback);
  },
  offReaction(
    callback: (
      wsData: WsNotificationResponse<{
        messageId: string;
        reactions: { [emoji: string]: string[] };
      }>
    ) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_REACTION, callback);
  },

  onMessagePin(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        message: MessageResponse | null;
      }>
    ) => void
  ) {
    webSocketService.on(ChatEvent.PIN_UPDATED, callback);
  },
  offMessagePin(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        message: MessageResponse | null;
      }>
    ) => void
  ) {
    webSocketService.off(ChatEvent.PIN_UPDATED, callback);
  },

  onSaveMessage(
    callback: (wsData: WsNotificationResponse<MessageResponse>) => void
  ) {
    webSocketService.on(ChatEvent.SAVE_MESSAGE, callback);
  },
  offSaveMessage(
    callback: (wsData: WsNotificationResponse<MessageResponse>) => void
  ) {
    webSocketService.off(ChatEvent.SAVE_MESSAGE, callback);
  },

  onImportantMessage(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        messageId: string;
        isImportant: boolean;
      }>
    ) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_IMPORTANT_TOGGLED, callback);
  },
  offImportantMessage(
    callback: (
      wsData: WsNotificationResponse<{
        chatId: string;
        messageId: string;
        isImportant: boolean;
      }>
    ) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_IMPORTANT_TOGGLED, callback);
  },

  onDeleteMessage(
    callback: (
      wsData: WsNotificationResponse<{ messageId: string; chatId: string }>
    ) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_DELETED, callback);
  },
  offDeleteMessage(
    callback: (
      wsData: WsNotificationResponse<{ messageId: string; chatId: string }>
    ) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_DELETED, callback);
  },

  onMessageError(
    callback: (
      wsData: WsNotificationResponse<{
        messageId: string;
        chatId: string;
        error: string;
        code?: string;
      }>
    ) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_ERROR, callback);
  },
  offMessageError(
    callback?: (
      wsData: WsNotificationResponse<{
        messageId: string;
        chatId: string;
        error: string;
        code?: string;
      }>
    ) => void
  ) {
    if (callback) webSocketService.off(ChatEvent.MESSAGE_ERROR, callback);
    else webSocketService.off(ChatEvent.MESSAGE_ERROR);
  },

  removeAllListeners() {
    const events = [
      ChatEvent.STATUS_CHANGED,
      ChatEvent.NEW_MESSAGE,
      ChatEvent.UPDATE_MESSAGE,
      ChatEvent.USER_TYPING,
      ChatEvent.MESSAGE_READ,
      ChatEvent.MESSAGE_REACTION,
      ChatEvent.PIN_UPDATED,
      ChatEvent.SAVE_MESSAGE,
      ChatEvent.MESSAGE_IMPORTANT_TOGGLED,
      ChatEvent.MESSAGE_DELETED,
      ChatEvent.MESSAGE_ERROR,
    ];
    events.forEach((event) => webSocketService.off(event));
  },
};
