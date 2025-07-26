import API from "../api/api";
import type { ChatResponse } from "@/types/responses/chat.response";
import { directChatService } from "./directChatService";
import { groupChatService } from "./groupChatService";
import type { ApiSuccessResponse } from "@/types/responses/apiSuccess.response";

export const chatService = {
  ...directChatService,
  ...groupChatService,
  // Get all direct and group chats
  async fetchAllChats(): Promise<ChatResponse[]> {
    try {
      const response = await API.get(`/chat`);
      console.log("Fetched chats", response.data.payload);
      return response.data.payload;
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      return []; // Return empty array or rethrow a custom error
    }
  },

  // Get a specific chat by ID
  async fetchChatById(chatId: string): Promise<ChatResponse> {
    const response = await API.get<ApiSuccessResponse<ChatResponse>>(
      `/chat/${chatId}`
    );
    return response.data.payload;
  },

  async fetchSavedChat(): Promise<ChatResponse> {
    try {
      const response = await API.get<ApiSuccessResponse<ChatResponse>>(
        `/chat/saved`
      );
      return response.data.payload;
    } catch (error) {
      console.error("Failed to fetch saved chat:", error);
      throw new Error("Unable to fetch saved chat.");
    }
  },

  async deleteChat(chatId: string): Promise<string> {
    const response = await API.delete<ApiSuccessResponse<string>>(
      `/chat-group/${chatId}`
    );
    return response.data.payload;
  },
};
