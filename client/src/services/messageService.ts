import API from "./api/api";
import { SendMessagePayload } from "@/types/sendMessagePayload";
import { MessageResponse } from "@/types/messageResponse";
import { UpdateMessageDto } from "@/types/updateMessageDto";


export const messageService = {
  async getChatMessages(
    chatId: string,
    offset: number = 0,
    limit: number = 50
  ): Promise<MessageResponse[]> {
    const { data } = await API.get(`/messages/chat/${chatId}`, {
      params: { offset, limit },
    });
    return data.payload;
  },

  async sendMessage(payload: SendMessagePayload): Promise<MessageResponse> {
    if (!payload.content && !payload.attachmentIds) {
      throw new Error("Message must have content or attachments");
    }
    const { data } = await API.post("/messages", payload);
    return data;
  },

  async editMessage(
    messageId: string,
    updateData: UpdateMessageDto
  ): Promise<MessageResponse> {
    const { data } = await API.put(`/messages/${messageId}`, updateData);
    return data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await API.delete(`/messages/${messageId}`);
  },

  // Either implement in controller or remove:
  async markAsRead(messageIds: string[]): Promise<void> {
    await API.patch("/messages/mark-read", { messageIds });
  },
};
