// src/services/websocket/chat.service.ts
import { SendMessagePayload } from "@/types/sendMessagePayload";
import { WebSocketService } from "./websocket.service";
import { MessageResponse } from "@/types/messageResponse";

const CHAT_NAMESPACE = "chat";

export class ChatWebSocketService extends WebSocketService {
  async getChatStatus(
    chatId: string
  ): Promise<{ chatId: string; isOnline: boolean } | null> {
    return new Promise((resolve) => {
      this.socket?.emit(
        `${CHAT_NAMESPACE}:getStatus`,
        chatId,
        (response: { chatId: string; isOnline: boolean }) => {
          resolve(response);
        }
      );
    });
  }

  typing(chatId: string, isTyping: boolean) {
    this.socket?.emit(`${CHAT_NAMESPACE}:typing`, { chatId, isTyping });
  }

  sendMessage(messagePayload: SendMessagePayload) {
    console.log('sendPayload: ', messagePayload)
    this.socket?.emit(`${CHAT_NAMESPACE}:sendMessage`, messagePayload);
  }

  markAsRead(chatId: string) {
    this.socket?.emit(`${CHAT_NAMESPACE}:markAsRead`, { chatId });
  }

  onNewMessage(callback: (message: MessageResponse) => void) {
    this.socket?.on("newMessage", callback);
  }

  offNewMessage(callback: (message: MessageResponse) => void) {
    this.socket?.off("newMessage", callback);
  }

  onTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    this.socket?.on("userTyping", callback);
  }

  offTyping(
    callback: (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => void
  ) {
    this.socket?.off("userTyping", callback);
  }

  onMessagesRead(
    callback: (data: {
      userId: string;
      chatId: string;
      timestamp: number;
    }) => void
  ) {
    this.socket?.on("messagesRead", callback);
  }

  offMessagesRead(
    callback: (data: {
      userId: string;
      chatId: string;
      timestamp: number;
    }) => void
  ) {
    this.socket?.off("messagesRead", callback);
  }
}

export const chatWebSocketService = new ChatWebSocketService();
