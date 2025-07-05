import API from "./api/api";
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { MessageResponse } from "@/types/responses/message.response";
import { UpdateMessageRequest } from "@/types/requests/updateMessage.request";

export const messageService = {
  async getChatMessages(
    chatId: string,
    options: { offset?: number; beforeMessageId?: string; limit?: number } = {}
  ): Promise<{ messages: MessageResponse[]; hasMore: boolean }> {
    const { offset, beforeMessageId, limit = 20 } = options;

    const { data } = await API.get(`/messages/chat/${chatId}`, {
      params: {
        ...(offset !== undefined ? { offset } : {}),
        ...(beforeMessageId ? { beforeMessageId } : {}),
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
