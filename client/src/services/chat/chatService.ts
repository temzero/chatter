import API from "../api/api";
import type { ChatResponse } from "@/types/chat";
import { directChatService } from "./directChatService";
import { groupChatService } from "./groupChatService";
import type { ApiSuccessResponse } from "@/types/apiSuccessResponse";

export const chatService = {
  ...directChatService,
  ...groupChatService,
  // Get all direct and group chats
  async getAllChats(): Promise<ChatResponse[]> {
    const response = await API.get(`/chat`);
    return response.data.payload;
  },

  // Get a specific chat by ID
  async fetchChatById(chatId: string): Promise<ChatResponse> {
    const response = await API.get<ApiSuccessResponse<ChatResponse>>(
      `/chat/${chatId}`
    );
    return response.data.payload;
  },
  // Delete a chat by ID
  async deleteChat(chatId: string, type?: string): Promise<string> {
    if (type && type === "group") {
      const response = await API.delete<ApiSuccessResponse<string>>(
        `/chat-group/${chatId}`
      );
      return response.data.payload; // This returns the deleted chat's ID
    } else {
      const response = await API.delete<ApiSuccessResponse<string>>(
        `/chat/${chatId}`
      );
      return response.data.payload; // This returns the deleted chat's ID
    }
  },
};
