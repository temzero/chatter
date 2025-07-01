import API from "../api/api";
import type { ChatResponse } from "@/types/responses/chat.response";
import type {
  ApiSuccessResponse,
  DirectChatApiResponse,
} from "@/types/responses/apiSuccess.response";

interface DirectChatDataResponse {
  payload: ChatResponse;
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
    updates: Partial<ChatResponse>
  ): Promise<ChatResponse> {
    const response = await API.put<ApiSuccessResponse<ChatResponse>>(
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
