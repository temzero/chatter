import API from "./api/api";
import { Message, SendMessagePayload } from "@/data/types"; // Adjust your types import

export const messageService = {
  // Get messages for a chat
  async getMessages(chatId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const { data } = await API.get(`/messages/${chatId}`, {
      params: { page, limit }
    });
    return data;
  },

  // Send a message
  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    const { data } = await API.post("/messages", payload);
    return data;
  },

  // Edit a message
  async editMessage(messageId: string, newContent: string): Promise<Message> {
    const { data } = await API.patch(`/messages/${messageId}`, { content: newContent });
    return data;
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    await API.delete(`/messages/${messageId}`);
  },

  // Mark messages as read
  async markAsRead(messageIds: string[]): Promise<void> {
    await API.patch("/messages/mark-read", { messageIds });
  }
};