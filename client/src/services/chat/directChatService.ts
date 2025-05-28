import API from "../api/api";
import type { DirectChatResponse } from "@/types/chat";
import type {
  ApiSuccessResponse,
  DirectChatApiResponse,
} from "@/types/apiSuccessResponse";

interface DirectChatDataResponse {
  payload: DirectChatResponse;
  wasExisting: boolean;
  message: string;
}

export const directChatService = {
  // Create or get an existing direct chat
  async createOrGetDirectChat(
    partnerId: string
  ): Promise<DirectChatDataResponse> {
    const response = await API.post<DirectChatApiResponse>("/chat/direct", {
      partnerId,
    });
    console.log("return direct chat data: ", response.data);
    return response.data;
  },

  // Update an existing direct chat
  async updateDirectChat(
    chatId: string,
    updates: Partial<DirectChatResponse>
  ): Promise<DirectChatResponse> {
    const response = await API.put<ApiSuccessResponse<DirectChatResponse>>(
      `/chat/${chatId}`,
      updates
    );
    return response.data.payload;
  },

  // Delete a direct chat
  async deleteDirectChat(chatId: string): Promise<void> {
    await API.delete<ApiSuccessResponse<void>>(`/chat/${chatId}`);
    // Typically delete operations don't return the deleted item
    // If you need confirmation, you might return response.data.message instead
  },
};
