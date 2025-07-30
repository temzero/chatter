// src/services/websocket/chat.service.ts
import { webSocketService } from "./websocket.service";
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { ForwardMessageRequest } from "@/types/requests/forwardMessage.request";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatMember } from "@/types/responses/chatMember.response";

const chatLink = "chat";
const CHAT_EVENTS = {
  GET_STATUS: `${chatLink}:getStatus`,
  STATUS_CHANGED: `${chatLink}:statusChanged`,
  TYPING: `${chatLink}:typing`,
  SEND_MESSAGE: `${chatLink}:sendMessage`,
  NEW_MESSAGE: `${chatLink}:newMessage`,
  FORWARD_MESSAGE: `${chatLink}:forwardMessage`,
  USER_TYPING: `${chatLink}:userTyping`,
  MESSAGE_READ: `${chatLink}:messageRead`,
  REACT_TO_MESSAGE: `${chatLink}:reactToMessage`,
  MESSAGE_REACTION: `${chatLink}:messageReaction`,
  TOGGLE_PIN_MESSAGE: `${chatLink}:togglePinMessage`,
  PIN_MESSAGE_UPDATED: `${chatLink}:pinMessageUpdated`,
  SAVE_MESSAGE: `${chatLink}:saveMessage`,
  MESSAGE_IMPORTANT_TOGGLED: `${chatLink}:messageImportantToggled`,
  TOGGLE_IMPORTANT: `${chatLink}:toggleImportant`,
  DELETE_MESSAGE: `${chatLink}:deleteMessage`,
  MESSAGE_DELETED: `${chatLink}:messageDeleted`,
  MESSAGE_ERROR: `${chatLink}:messageError`,
  MEMBER_ADDED: `${chatLink}:memberAdded`,
  MEMBER_REMOVED: `${chatLink}:memberRemoved`,
};

export const chatWebSocketService = {
  async getChatStatus(chatId: string) {
    return new Promise<{ chatId: string; isOnline: boolean }>((resolve) => {
      webSocketService.emit(
        CHAT_EVENTS.GET_STATUS,
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
    webSocketService.on(CHAT_EVENTS.STATUS_CHANGED, callback);
  },

  offStatusChanged(
    callback: (data: {
      userId: string;
      chatId: string;
      isOnline: boolean;
    }) => void
  ) {
    webSocketService.off(CHAT_EVENTS.STATUS_CHANGED, callback);
  },

  typing(chatId: string, isTyping: boolean) {
    webSocketService.emit(CHAT_EVENTS.TYPING, { chatId, isTyping });
  },

  sendMessage(message: SendMessageRequest) {
    webSocketService.emit(CHAT_EVENTS.SEND_MESSAGE, message);
  },

  onNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on(CHAT_EVENTS.NEW_MESSAGE, callback);
  },

  offNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off(CHAT_EVENTS.NEW_MESSAGE, callback);
  },

  forwardMessage(message: ForwardMessageRequest) {
    webSocketService.emit(CHAT_EVENTS.FORWARD_MESSAGE, message);
  },

  onTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    webSocketService.on(CHAT_EVENTS.USER_TYPING, callback);
  },

  offTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    webSocketService.off(CHAT_EVENTS.USER_TYPING, callback);
  },

  messageRead(chatId: string, memberId: string, messageId: string) {
    webSocketService.emit(CHAT_EVENTS.MESSAGE_READ, {
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
    webSocketService.on(CHAT_EVENTS.MESSAGE_READ, callback);
  },

  offMessagesRead(
    callback: (data: {
      chatId: string;
      memberId: string;
      messageId: string;
    }) => void
  ) {
    webSocketService.off(CHAT_EVENTS.MESSAGE_READ, callback);
  },

  reactToMessage(payload: {
    messageId: string;
    chatId: string;
    emoji: string;
  }) {
    webSocketService.emit(CHAT_EVENTS.REACT_TO_MESSAGE, payload);
  },

  onReaction(
    callback: (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => void
  ) {
    webSocketService.on(CHAT_EVENTS.MESSAGE_REACTION, callback);
  },

  offReaction(
    callback: (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => void
  ) {
    webSocketService.off(CHAT_EVENTS.MESSAGE_REACTION, callback);
  },

  togglePinMessage(payload: { chatId: string; messageId: string | null }) {
    webSocketService.emit(CHAT_EVENTS.TOGGLE_PIN_MESSAGE, payload);
  },

  onMessagePin(
    callback: (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => void
  ) {
    webSocketService.on(CHAT_EVENTS.PIN_MESSAGE_UPDATED, callback);
  },

  offMessagePin(
    callback: (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => void
  ) {
    webSocketService.off(CHAT_EVENTS.PIN_MESSAGE_UPDATED, callback);
  },

  saveMessage(payload: { messageId: string | null }) {
    webSocketService.emit(CHAT_EVENTS.SAVE_MESSAGE, payload);
  },

  onSaveMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on(CHAT_EVENTS.SAVE_MESSAGE, callback);
  },

  offSaveMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off(CHAT_EVENTS.SAVE_MESSAGE, callback);
  },

  toggleImportantMessage(payload: {
    messageId: string;
    chatId: string;
    isImportant: boolean;
  }) {
    webSocketService.emit(CHAT_EVENTS.TOGGLE_IMPORTANT, payload);
  },

  onImportantMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on(CHAT_EVENTS.MESSAGE_IMPORTANT_TOGGLED, callback);
  },

  offImportantMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off(CHAT_EVENTS.MESSAGE_IMPORTANT_TOGGLED, callback);
  },

  deleteMessage(payload: {
    messageId: string;
    chatId: string;
    isDeleteForEveryone: boolean;
  }) {
    webSocketService.emit(CHAT_EVENTS.DELETE_MESSAGE, payload);
  },

  onDeleteMessage(
    callback: (data: { messageId: string; chatId: string }) => void
  ) {
    webSocketService.on(CHAT_EVENTS.MESSAGE_DELETED, callback);
  },

  offDeleteMessage(
    callback: (data: { messageId: string; chatId: string }) => void
  ) {
    webSocketService.off(CHAT_EVENTS.MESSAGE_DELETED, callback);
  },

  onMessageError(
    callback: (error: {
      messageId: string;
      chatId: string;
      error: string;
      code?: string;
    }) => void
  ) {
    webSocketService.on(CHAT_EVENTS.MESSAGE_ERROR, callback);
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
      webSocketService.off(CHAT_EVENTS.MESSAGE_ERROR, callback);
    } else {
      webSocketService.off(CHAT_EVENTS.MESSAGE_ERROR);
    }
  },

  onMemberAdded(callback: (member: ChatMember) => void) {
    webSocketService.on(CHAT_EVENTS.MEMBER_ADDED, callback);
  },

  offMemberAdded(callback: (member: ChatMember) => void) {
    webSocketService.off(CHAT_EVENTS.MEMBER_ADDED, callback);
  },

  onMemberRemoved(callback: (member: ChatMember) => void) {
    webSocketService.on(CHAT_EVENTS.MEMBER_REMOVED, callback);
  },

  offMemberRemoved(callback: (member: ChatMember) => void) {
    webSocketService.off(CHAT_EVENTS.MEMBER_REMOVED, callback);
  },
};
