import API from "../api/api";
import type { GroupChatResponse } from "@/types/chat";
import type { ApiSuccessResponse } from "@/types/apiSuccessResponse";
import { ChatType } from "@/types/enums/ChatType";

export const groupChatService = {
  // Create a new Group/Channel
  async createGroupChat(payload: {
    name: string;
    memberIds: string[];
    type: ChatType.GROUP | ChatType.CHANNEL;
  }): Promise<GroupChatResponse> {
    const response = await API.post<ApiSuccessResponse<GroupChatResponse>>(
      "/chat/group",
      payload
    );
    return response.data.payload;
  },

  async getGroupChatById(groupChatId: string): Promise<GroupChatResponse> {
    const response = await API.get<ApiSuccessResponse<GroupChatResponse>>(
      `/chat/${groupChatId}`
    );
    return response.data.payload;
  },

  async updateGroupChat(
    groupChatId: string,
    payload: Partial<GroupChatResponse>
  ): Promise<GroupChatResponse> {
    const response = await API.put<ApiSuccessResponse<GroupChatResponse>>(
      `/chat/${groupChatId}`,
      payload
    );
    return response.data.payload;
  },

  // Delete a group chat
  async deleteGroupChat(groupChatId: string): Promise<string> {
    const response = await API.delete<ApiSuccessResponse<string>>(
      `/chat/${groupChatId}`
    );
    return response.data.payload;
  },
};
