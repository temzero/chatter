import API from "../api/api";
import type {PrivateChat } from "@/types/chat";

type ResponseData<T> = {
  data: T;
  statusCode: number;
  message: string;
};

export const privateChatService = {
  // Create a new private chat
  async createPrivateChat(chatPartnerId: string): Promise<PrivateChat> {
    const response = await API.post<ResponseData<PrivateChat>>(
      `/chat/create/${chatPartnerId}`
    );
    return response.data.data;
  },

  // Update an existing private chat
  async updatePrivateChat(chatId: string, updates: Partial<PrivateChat>): Promise<PrivateChat> {
    const response = await API.put<ResponseData<PrivateChat>>(
      `/chat/${chatId}`,
      updates
    );
    return response.data.data;
  },

  // Delete a private chat
  async deletePrivateChat(chatId: string): Promise<string> {
    const response = await API.delete<ResponseData<string>>(`/chat/${chatId}`);
    return response.data.data;
  },
};
