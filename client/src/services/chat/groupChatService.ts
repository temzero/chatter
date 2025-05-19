import API from "../api/api";
import type { GroupChat, ChatGroupMember } from "@/types/chat";

type ResponseData<T> = {
  data: T;
  statusCode: number;
  message: string;
};

export const groupChatService = {
  // Create a new Group/Channel
  async createGroupChat(payload: {
    name: string;
    memberIds: string[];
    type: "group" | "channel";
  }): Promise<GroupChat> {
    const response = await API.post<ResponseData<GroupChat>>(
      "/chat-group/create",
      payload
    );
    return response.data.data;
  },

  async getGroupChatById(groupChatId: string): Promise<GroupChat> {
    const response = await API.get<ResponseData<GroupChat>>(
      `/chat-group/${groupChatId}`
    );
    return response.data.data;
  },

  async getGroupChatMembers(groupChatId: string): Promise<ChatGroupMember[]> {
    const response = await API.get<ResponseData<ChatGroupMember[]>>(
      `/chat-group-members/${groupChatId}`
    );
    return response.data.data;
  },

  async updateGroupChat(groupChatId: string, payload: Partial<GroupChat>): Promise<GroupChat> {
    const response = await API.put<ResponseData<GroupChat>>(
      `/chat-group/${groupChatId}`,
      payload
    );
    return response.data.data;
  },

  // Delete a group chat
  async deleteGroupChat(groupChatId: string): Promise<string> {
    const response = await API.delete<ResponseData<string>>(
      `/chat-group/${groupChatId}`
    );
    return response.data.data;
  },
};
