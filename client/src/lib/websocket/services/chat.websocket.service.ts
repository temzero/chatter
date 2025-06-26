// src/services/websocket/chat.service.ts
import { ForwardMessagePayload, SendMessagePayload } from "@/types/sendMessagePayload";
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

  // Event listeners
  onNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.on("chat:newMessage", callback);
  }

  offNewMessage(callback: (message: MessageResponse) => void) {
    webSocketService.off("chat:newMessage", callback);
  }

  async forwardMessage(message: ForwardMessagePayload) {
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
    userId: string;
  }) {
    console.log("reactToMessage", payload);
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
}

export const chatWebSocketService = new ChatWebSocketService();
