import API from "../api/api";
import type { PrivateChat } from "@/types/chat";

type SuccessResponse<T> = {
  data: T;
  statusCode: number;
  message: string;
};

export const privateChatService = {
  // Create a new direct chat
  async createPrivateChat(chatPartnerId: string): Promise<PrivateChat> {
    const response = await API.post<SuccessResponse<PrivateChat>>(
      `/chat/create/${chatPartnerId}`
    );
    return response.data.payload;
  },

  // Update an existing direct chat
  async updatePrivateChat(
    chatId: string,
    updates: Partial<PrivateChat>
  ): Promise<PrivateChat> {
    const response = await API.put<SuccessResponse<PrivateChat>>(
      `/chat/${chatId}`,
      updates
    );
    return response.data.payload;
  },

  // Delete a direct chat
  async deletePrivateChat(chatId: string): Promise<string> {
    const response = await API.delete<SuccessResponse<string>>(
      `/chat/${chatId}`
    );
    return response.data.payload;
  },
};
