import API from "./api/api";
import type { Chat } from "@/types/chat";

type ResponseData<T> = {
  data: T;
  statusCode: number;
  message: string;
};

export const chatService = {
  // Get all conversations (private chats + groups) for a user
  async getAllChats(): Promise<Chat[]> {
    const response = await API.get<ResponseData<Chat[]>>(`/chat/all`);
    return response.data.data;
  },
  // Get a specific chat by ID
  async getChatById(chatId: string): Promise<Chat> {
    const response = await API.get<ResponseData<Chat>>(`/chat/${chatId}`);
    return response.data.data;
  },
  // Create a new chat
  async createChat(payload: { member1Id: string, member2Id: string }): Promise<Chat> {
    const response = await API.post<ResponseData<Chat>>("/chat", payload);
    return response.data.data;
  },
  // Create a new Group/Channel
  async createGroup(payload: {name: string, memberIds: string[]; type: 'group' | 'channel' }): Promise<Chat> {
    const response = await API.post<ResponseData<Chat>>("/chat-group", payload);
    return response.data.data;
  },
  // Update an existing chat
  async updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat> {
    const response = await API.put<ResponseData<Chat>>(`/chat/${chatId}`, updates);
    return response.data.data;
  },
  // Delete a chat by ID
  async deleteChat(chatId: string, type?: string): Promise<string> {
    if (type && type === 'group') {
      const response = await API.delete<ResponseData<string>>(`/chat-group/${chatId}`);
      return response.data.data; // This returns the deleted chat's ID
    } else {
      const response = await API.delete<ResponseData<string>>(`/chat/${chatId}`);
      return response.data.data; // This returns the deleted chat's ID
    }
  },
};
