import API from "./api/api";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { UpdateMessageRequest } from "@/shared/types/requests/update-message.request";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";

export const messageService = {
  async getChatMessages(
    chatId: string,
    options?: PaginationQuery
  ): Promise<PaginationResponse<MessageResponse>> {
    try {
      const { offset, lastId, limit = 20 } = options || {};

      const { data } = await API.get(`/messages/chat/${chatId}`, {
        params: {
          ...(offset !== undefined ? { offset } : {}),
          ...(lastId ? { lastId } : {}),
          limit,
        },
      });

      return data.payload;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      throw new Error("Failed to fetch chat messages");
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
