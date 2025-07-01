import API from "./api/api";
import { SendMessageRequest } from "@/types/requests/sendMessage.request";
import { MessageResponse } from "@/types/responses/message.response";
import { UpdateMessageRequest } from "@/types/requests/updateMessage.request";

export const messageService = {
  async getChatMessages(
    chatId: string,
    offset: number = 0,
    limit: number = 20
  ): Promise<MessageResponse[]> {
    const { data } = await API.get(`/messages/chat/${chatId}`, {
      params: { offset, limit },
    });
    console.log("chatMessages: ", data.payload);
    return data.payload;
  },

  async sendMessage(payload: SendMessageRequest): Promise<MessageResponse> {
    if (!payload.content && !payload.attachmentIds) {
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
