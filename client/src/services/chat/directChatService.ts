import API from "../api/api";
import type { DirectChat } from "@/types/chat";
import type { ApiSuccessResponse } from "@/types/apiSuccessResponse";

export const privateChatService = {
  // Create a new direct chat
  async createPrivateChat(chatPartnerId: string): Promise<DirectChat> {
    const response = await API.post<ApiSuccessResponse<DirectChat>>(
      `/chat/create/${chatPartnerId}`
    );
    return response.data.payload;
  },

  // Update an existing direct chat
  async updatePrivateChat(
    chatId: string,
    updates: Partial<DirectChat>
  ): Promise<DirectChat> {
    const response = await API.put<ApiSuccessResponse<DirectChat>>(
      `/chat/${chatId}`,
      updates
    );
    return response.data.payload;
  },

  // Delete a direct chat
  async deletePrivateChat(chatId: string): Promise<string> {
    const response = await API.delete<ApiSuccessResponse<string>>(
      `/chat/${chatId}`
    );
    return response.data.payload;
  },
};
