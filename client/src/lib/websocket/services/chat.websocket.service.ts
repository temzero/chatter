// src/services/websocket/chat.service.ts
import { webSocketService } from "./websocket.service";
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { ForwardMessageRequest } from "@/types/requests/forwardMessage.request";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatMember } from "@/types/responses/chatMember.response";
import { ChatEvent } from "../constants/websocket-event.type";

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

  sendMessage(message: SendMessageRequest) {
    webSocketService.emit(ChatEvent.SEND_MESSAGE, message);
  },

  onNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on(ChatEvent.NEW_MESSAGE, callback);
  },

  offNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off(ChatEvent.NEW_MESSAGE, callback);
  },

  forwardMessage(message: ForwardMessageRequest) {
    webSocketService.emit(ChatEvent.FORWARD_MESSAGE, message);
  },

  onTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    webSocketService.on(ChatEvent.USER_TYPING, callback);
  },

  offTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    webSocketService.off(ChatEvent.USER_TYPING, callback);
  },

  messageRead(chatId: string, memberId: string, messageId: string) {
    webSocketService.emit(ChatEvent.MESSAGE_READ, {
      chatId,
      memberId,
      messageId,
    });
  },

  onMessagesRead(
    callback: (data: {
      chatId: string;
      memberId: string;
      messageId: string;
    }) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_READ, callback);
  },

  offMessagesRead(
    callback: (data: {
      chatId: string;
      memberId: string;
      messageId: string;
    }) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_READ, callback);
  },

  reactToMessage(payload: {
    messageId: string;
    chatId: string;
    emoji: string;
  }) {
    webSocketService.emit(ChatEvent.REACT_TO_MESSAGE, payload);
  },

  onReaction(
    callback: (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_REACTION, callback);
  },

  offReaction(
    callback: (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_REACTION, callback);
  },

  togglePinMessage(payload: { chatId: string; messageId: string | null }) {
    webSocketService.emit(ChatEvent.TOGGLE_PIN_MESSAGE, payload);
  },

  onMessagePin(
    callback: (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => void
  ) {
    webSocketService.on(ChatEvent.PIN_UPDATED, callback);
  },

  offMessagePin(
    callback: (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => void
  ) {
    webSocketService.off(ChatEvent.PIN_UPDATED, callback);
  },

  saveMessage(payload: { messageId: string | null }) {
    webSocketService.emit(ChatEvent.SAVE_MESSAGE, payload);
  },

  onSaveMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on(ChatEvent.SAVE_MESSAGE, callback);
  },

  offSaveMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off(ChatEvent.SAVE_MESSAGE, callback);
  },

  toggleImportantMessage(payload: {
    messageId: string;
    chatId: string;
    isImportant: boolean;
  }) {
    webSocketService.emit(ChatEvent.TOGGLE_IMPORTANT, payload);
  },

  onImportantMessage(
    callback: (update: {
      chatId: string;
      messageId: string;
      isImportant: boolean;
    }) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_IMPORTANT_TOGGLED, callback);
  },

  offImportantMessage(
    callback: (update: {
      chatId: string;
      messageId: string;
      isImportant: boolean;
    }) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_IMPORTANT_TOGGLED, callback);
  },

  deleteMessage(payload: {
    messageId: string;
    chatId: string;
    isDeleteForEveryone: boolean;
  }) {
    webSocketService.emit(ChatEvent.DELETE_MESSAGE, payload);
  },

  onDeleteMessage(
    callback: (data: { messageId: string; chatId: string }) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_DELETED, callback);
  },

  offDeleteMessage(
    callback: (data: { messageId: string; chatId: string }) => void
  ) {
    webSocketService.off(ChatEvent.MESSAGE_DELETED, callback);
  },

  onMessageError(
    callback: (error: {
      messageId: string;
      chatId: string;
      error: string;
      code?: string;
    }) => void
  ) {
    webSocketService.on(ChatEvent.MESSAGE_ERROR, callback);
  },

  offMessageError(
    callback?: (error: {
      messageId: string;
      chatId: string;
      error: string;
      code?: string;
    }) => void
  ) {
    if (callback) {
      webSocketService.off(ChatEvent.MESSAGE_ERROR, callback);
    } else {
      webSocketService.off(ChatEvent.MESSAGE_ERROR);
    }
  },

  onMemberAdded(callback: (member: ChatMember) => void) {
    webSocketService.on(ChatEvent.MEMBER_ADDED, callback);
  },

  offMemberAdded(callback: (member: ChatMember) => void) {
    webSocketService.off(ChatEvent.MEMBER_ADDED, callback);
  },

  onMemberRemoved(callback: (member: ChatMember) => void) {
    webSocketService.on(ChatEvent.MEMBER_REMOVED, callback);
  },

  offMemberRemoved(callback: (member: ChatMember) => void) {
    webSocketService.off(ChatEvent.MEMBER_REMOVED, callback);
  },
};
