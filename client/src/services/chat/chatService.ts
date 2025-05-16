import API from "../api/api";
import type { Chat } from "@/types/chat";
import { privateChatService } from "./privateChatService";
import { groupChatService } from "./groupChatService";

type ResponseData<T> = {
  data: T;
  statusCode: number;
  message: string;
};

export const chatService = {
  ...privateChatService,
  ...groupChatService,
  // Get all private and group chats
  async getAllChats(): Promise<Chat[]> {
    const response = await API.get<ResponseData<Chat[]>>(`/chat/all`);
    return response.data.data;
  },

  // Get a specific chat by ID
  async getChatById(chatId: string): Promise<Chat> {
    const response = await API.get<ResponseData<Chat>>(`/chat/${chatId}`);
    return response.data.data;
  },

  // Delete a chat by ID
  async deleteChat(chatId: string, type?: string): Promise<string> {
    if (type && type === "group") {
      const response = await API.delete<ResponseData<string>>(
        `/chat-group/${chatId}`
      );
      return response.data.data; // This returns the deleted chat's ID
    } else {
      const response = await API.delete<ResponseData<string>>(
        `/chat/${chatId}`
      );
      return response.data.data; // This returns the deleted chat's ID
    }
  },
};
