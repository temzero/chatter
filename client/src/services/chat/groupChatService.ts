import API from "../api/api";
import type { GroupChannelChat } from "@/types/chat";
import type { ApiSuccessResponse } from "@/types/apiSuccessResponse";

export const groupChatService = {
  // Create a new Group/Channel
  async createGroupChat(payload: {
    name: string;
    memberIds: string[];
    type: "group" | "channel";
  }): Promise<GroupChannelChat> {
    const response = await API.post<ApiSuccessResponse<GroupChannelChat>>(
      "/chat-group/create",
      payload
    );
    return response.data.payload;
  },

  async getGroupChatById(groupChatId: string): Promise<GroupChannelChat> {
    const response = await API.get<ApiSuccessResponse<GroupChannelChat>>(
      `/chat-group/${groupChatId}`
    );
    return response.data.payload;
  },

  async updateGroupChat(
    groupChatId: string,
    payload: Partial<GroupChannelChat>
  ): Promise<GroupChannelChat> {
    const response = await API.put<ApiSuccessResponse<GroupChannelChat>>(
      `/chat-group/${groupChatId}`,
      payload
    );
    return response.data.payload;
  },

  // Delete a group chat
  async deleteGroupChat(groupChatId: string): Promise<string> {
    const response = await API.delete<ApiSuccessResponse<string>>(
      `/chat-group/${groupChatId}`
    );
    return response.data.payload;
  },
};
