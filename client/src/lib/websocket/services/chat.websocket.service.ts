// src/services/websocket/chat.service.ts
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { ForwardMessageRequest } from "@/types/requests/forwardMessage.request";
import { webSocketService } from "./websocket.service";
import { MessageResponse } from "@/types/responses/message.response";

export class ChatWebSocketService {
  async getChatStatus(
    chatId: string
  ): Promise<{ chatId: string; isOnline: boolean } | null> {
    return new Promise((resolve) => {
      webSocketService.emit("chat:getStatus", chatId, (response: unknown) => {
        resolve(response as { chatId: string; isOnline: boolean });
      });
    });
  }

  onStatusChanged(
    callback: (data: {
      userId: string;
      chatId: string;
      isOnline: boolean;
    }) => void
  ) {
    webSocketService.on("chat:statusChanged", callback);
  }

  offStatusChanged(
    callback: (data: {
      userId: string;
      chatId: string;
      isOnline: boolean;
    }) => void
  ) {
    webSocketService.off("chat:statusChanged", callback);
  }

  typing(chatId: string, isTyping: boolean) {
    webSocketService.emit("chat:typing", { chatId, isTyping });
  }

  async sendMessage(message: SendMessageRequest) {
    webSocketService.emit("chat:sendMessage", message);
  }

  // Event listeners
  onNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on("chat:newMessage", callback);
  }

  offNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off("chat:newMessage", callback);
  }

  async forwardMessage(message: ForwardMessageRequest) {
    webSocketService.emit("chat:forwardMessage", message);
  }

  onTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    webSocketService.on("chat:userTyping", callback);
  }

  offTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    webSocketService.off("chat:userTyping", callback);
  }

  // Message Read
  messageRead(chatId: string, memberId: string, messageId: string) {
    webSocketService.emit("chat:messageRead", { chatId, memberId, messageId });
  }

  onMessagesRead(
    callback: (data: {
      chatId: string;
      memberId: string;
      messageId: string;
    }) => void
  ) {
    webSocketService.on("chat:messageRead", callback);
  }

  offMessagesRead(
    callback: (data: {
      chatId: string;
      memberId: string;
      messageId: string;
    }) => void
  ) {
    webSocketService.off("chat:messageRead", callback);
  }

  reactToMessage(payload: {
    messageId: string;
    chatId: string;
    emoji: string;
  }) {
    webSocketService.emit("chat:reactToMessage", payload);
  }

  /**
   * Listen for reaction updates
   * @param callback Function to call when reactions are updated
   */
  onReaction(
    callback: (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => void
  ) {
    webSocketService.on("chat:messageReaction", callback);
  }

  /**
   * Remove reaction listener
   * @param callback Same callback used in onReactionUpdate
   */
  offReaction(
    callback: (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => void
  ) {
    webSocketService.off("chat:messageReaction", callback);
  }

  togglePinMessage(payload: { chatId: string; messageId: string | null }) {
    webSocketService.emit("chat:togglePinMessage", payload);
  }

  onMessagePin(
    callback: (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => void
  ) {
    webSocketService.on("chat:pinMessageUpdated", callback);
  }

  offMessagePin(
    callback: (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => void
  ) {
    webSocketService.off("chat:pinMessageUpdated", callback);
  }

  saveMessage(payload: { messageId: string | null }) {
    webSocketService.emit("chat:saveMessage", payload);
  }

  onSaveMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on("chat:saveMessage", callback);
  }

  offSaveMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off("chat:saveMessage", callback);
  }

  toggleImportantMessage(payload: {
    messageId: string;
    chatId: string;
    isImportant: boolean;
  }) {
    webSocketService.emit("chat:toggleImportant", payload);
  }

  onImportantMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on("chat:messageImportantToggled", callback);
  }

  offImportantMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off("chat:messageImportantToggled", callback);
  }

  // --- Emit delete message request to server
  deleteMessage(payload: {
    messageId: string;
    chatId: string;
    isDeleteForEveryone: boolean;
  }) {
    webSocketService.emit("chat:deleteMessage", payload);
  }

  // --- Listen for deleted message notification
  onDeleteMessage(
    callback: (data: { messageId: string; chatId: string }) => void
  ) {
    webSocketService.on("chat:messageDeleted", callback);
  }

  // --- Remove listener
  offDeleteMessage(
    callback: (data: { messageId: string; chatId: string }) => void
  ) {
    webSocketService.off("chat:messageDeleted", callback);
  }

  /**
   * Listen for message errors
   */
  onMessageError(
    callback: (error: {
      messageId: string;
      chatId: string;
      error: string;
      code?: string;
    }) => void
  ) {
    webSocketService.on("chat:messageError", callback);
  }

  /**
   * Remove message error listener
   */
  offMessageError(
    callback?: (error: {
      messageId: string;
      chatId: string;
      error: string;
      code?: string;
    }) => void
  ) {
    if (callback) {
      webSocketService.off("chat:messageError", callback);
    } else {
      webSocketService.off("chat:messageError");
    }
  }
}

export const chatWebSocketService = new ChatWebSocketService();
