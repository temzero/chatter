import API from "./api/api";
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { MessageResponse } from "@/types/responses/message.response";
import { UpdateMessageRequest } from "@/types/requests/updateMessage.request";
import { PaginationQuery } from "@/types/query/paginationQuery";

export const messageService = {
  async getChatMessages(
    chatId: string,
    options: PaginationQuery = { limit: 10 }
  ): Promise<{ messages: MessageResponse[]; hasMore: boolean }> {
    try {
      const { offset, lastId, limit } = options;

      const { data } = await API.get(`/messages/chat/${chatId}`, {
        params: {
          ...(offset !== undefined ? { offset } : {}),
          ...(lastId ? { lastId } : {}),
          limit,
        },
      });

      const { messages, hasMore } = data.payload;
      return { messages, hasMore };
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      throw new Error("Failed to fetch chat messages");
    }
  },

  async sendMessage(payload: SendMessageRequest): Promise<MessageResponse> {
    try {
      if (!payload.content && !payload.attachments) {
        throw new Error("Message must have content or attachments");
      }
      const { data } = await API.post("/messages", payload);
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message");
    }
  },

  async editMessage(
    messageId: string,
    updateData: UpdateMessageRequest
  ): Promise<MessageResponse> {
    try {
      const { data } = await API.put(`/messages/${messageId}`, updateData);
      return data;
    } catch (error) {
      console.error("Error editing message:", error);
      throw new Error("Failed to edit message");
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await API.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error("Failed to delete message");
    }
  },
};
