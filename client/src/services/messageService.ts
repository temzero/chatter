import API from "./api/api";
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { MessageResponse } from "@/types/responses/message.response";
import { UpdateMessageRequest } from "@/types/requests/updateMessage.request";
import { PaginationQuery } from "@/types/query/paginationQuery";

export const messageService = {
  async getChatMessages(
    chatId: string,
    options: PaginationQuery = { limit: 20 }
  ): Promise<{ messages: MessageResponse[]; hasMore: boolean }> {
    const { offset, beforeId, limit } = options;

    const { data } = await API.get(`/messages/chat/${chatId}`, {
      params: {
        ...(offset !== undefined ? { offset } : {}),
        ...(beforeId ? { beforeId } : {}),
        limit,
      },
    });

    const { messages, hasMore } = data.payload;
    return { messages, hasMore };
  },

  async sendMessage(payload: SendMessageRequest): Promise<MessageResponse> {
    if (!payload.content && !payload.attachments) {
      throw new Error("Message must have content or attachments");
    }
    const { data } = await API.post("/messages", payload);
    return data;
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
