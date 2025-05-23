import API from "../api/api";
import type { GroupChat, ChatGroupMember } from "@/types/chat";

type SuccessResponse<T> = {
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
    const response = await API.post<SuccessResponse<GroupChat>>(
      "/chat-group/create",
      payload
    );
    return response.data.payload;
  },

  async getGroupChatById(groupChatId: string): Promise<GroupChat> {
    const response = await API.get<SuccessResponse<GroupChat>>(
      `/chat-group/${groupChatId}`
    );
    return response.data.payload;
  },

  async getGroupChatMembers(groupChatId: string): Promise<ChatGroupMember[]> {
    const response = await API.get<SuccessResponse<ChatGroupMember[]>>(
      `/chat-group-members/${groupChatId}`
    );
    return response.data.payload;
  },

  async updateGroupChat(
    groupChatId: string,
    payload: Partial<GroupChat>
  ): Promise<GroupChat> {
    const response = await API.put<SuccessResponse<GroupChat>>(
      `/chat-group/${groupChatId}`,
      payload
    );
    return response.data.payload;
  },

  // Delete a group chat
  async deleteGroupChat(groupChatId: string): Promise<string> {
    const response = await API.delete<SuccessResponse<string>>(
      `/chat-group/${groupChatId}`
    );
    return response.data.payload;
  },
};
