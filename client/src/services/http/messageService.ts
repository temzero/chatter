import API from "@/services/api/api";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { UpdateMessageRequest } from "@/shared/types/requests/update-message.request";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";

export const messageService = {
  async fetchChatMessages(
    chatId: string,
    query?: PaginationQuery
  ): Promise<PaginationResponse<MessageResponse>> {
    const { data } = await API.get(`/messages/chat/${chatId}`, {
      params: query,
    });

    return data.payload;
  },

  async editMessage(
    messageId: string,
    updateData: UpdateMessageRequest
  ): Promise<MessageResponse> {
    const { data } = await API.put(`/messages/${messageId}`, updateData);
    return data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await API.delete(`/messages/${messageId}`);
  },
};
