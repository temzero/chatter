import API from "../api/api";
import type { Chat } from "@/types/chat";
import { privateChatService } from "./privateChatService";
import { groupChatService } from "./groupChatService";

type SuccessResponse<T> = {
  payload: T;
  message: string;
};

export const chatService = {
  ...privateChatService,
  ...groupChatService,
  // Get all direct and group chats
  async getAllChats(): Promise<Chat[]> {
    const response = await API.get(`/chat`);
    return response.data.payload;
  },

  // Get a specific chat by ID
  async getChatById(chatId: string): Promise<Chat> {
    const response = await API.get<SuccessResponse<Chat>>(`/chat/${chatId}`);
    return response.data.payload;
  },

  // Delete a chat by ID
  async deleteChat(chatId: string, type?: string): Promise<string> {
    if (type && type === "group") {
      const response = await API.delete<SuccessResponse<string>>(
        `/chat-group/${chatId}`
      );
      return response.data.payload; // This returns the deleted chat's ID
    } else {
      const response = await API.delete<SuccessResponse<string>>(
        `/chat/${chatId}`
      );
      return response.data.payload; // This returns the deleted chat's ID
    }
  },
};
