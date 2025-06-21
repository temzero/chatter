// src/services/websocket/chat.service.ts
import { SendMessagePayload } from "@/types/sendMessagePayload";
import { webSocketService } from "./websocket.service";
import { MessageResponse } from "@/types/messageResponse";

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

  async sendMessage(message: SendMessagePayload) {
    webSocketService.emit("chat:sendMessage", message);
  }

  markAsRead(memberId: string, messageId: string) {
    webSocketService.emit("chat:markAsRead", { memberId, messageId });
  }

  // Event listeners
  onNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on("chat:newMessage", callback);
  }

  offNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off("chat:newMessage", callback);
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

  onMessagesRead(callback: (data: { memberId: string }) => void) {
    webSocketService.on("chat:markAsRead", callback);
  }

  offMessagesRead(callback: (data: { memberId: string }) => void) {
    webSocketService.off("chat:markAsRead", callback);
  }
}

export const chatWebSocketService = new ChatWebSocketService();
