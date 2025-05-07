import API from "./api/api";
import type { Chat } from "@/types/chat";

type ResponseData<T> = {
  data: T;
  statusCode: number;
  message: string;
};

type Conversation = Chat & {
  // Add other possible fields if needed, e.g. for ChatGroup
};

export const chatService = {
  // Get all chats (admin use or all available chats)
  async getAllChats(): Promise<Chat[]> {
    const response = await API.get<ResponseData<Chat[]>>("/chat");
    return response.data.data;
  },

  // Get all conversations (private chats + groups) for a user
  async getAllChatsByUserId(userId: string): Promise<Conversation[]> {
    const response = await API.get<ResponseData<Conversation[]>>(`/chat/all/user/${userId}`);
    return response.data.data;
  },

  // Get a specific chat by ID
  async getChatById(chatId: string): Promise<Chat> {
    const response = await API.get<ResponseData<Chat>>(`/chat/${chatId}`);
    return response.data.data;
  },

  // Create a new chat
  async createChat(payload: { participants: string[]; isGroup?: boolean }): Promise<Chat> {
    const response = await API.post<ResponseData<Chat>>("/chat", payload);
    return response.data.data;
  },

  // Update an existing chat
  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    const response = await API.put<ResponseData<Chat>>(`/chat/${chatId}`, updates);
    return response.data.data;
  },

  // Delete a chat by ID
  async deleteChat(chatId: string): Promise<string> {
    const response = await API.delete<ResponseData<string>>(`/chat/${chatId}`);
    return response.data.data; // This returns the deleted chat's ID
  },
};
