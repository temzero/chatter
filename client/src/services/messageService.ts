import API from "./api/api";
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { MessageResponse } from "@/types/responses/message.response";
import { UpdateMessageRequest } from "@/types/requests/updateMessage.request";

export const messageService = {
  async getChatMessages(
    chatId: string,
    options: { offset?: number; beforeMessageId?: string; limit?: number } = {}
  ): Promise<MessageResponse[]> {
    const { offset, beforeMessageId, limit = 20 } = options;

    const { data } = await API.get(`/messages/chat/${chatId}`, {
      params: {
        ...(offset !== undefined ? { offset } : {}),
        ...(beforeMessageId ? { beforeMessageId } : {}),
        limit,
      },
    });

    return data.payload;
  },

  async getMoreChatMessages(
    chatId: string,
    beforeMessageId: string,
    limit: number = 10
  ): Promise<MessageResponse[]> {
    const { data } = await API.get(`/messages/chat/more/${chatId}`, {
      params: { beforeMessageId, limit },
    });
    return data.payload;
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
