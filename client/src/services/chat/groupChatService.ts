import API from "../api/api";
import type { ChatResponse } from "@/types/chat";
import type { ApiSuccessResponse } from "@/types/apiSuccessResponse";
import { ChatType } from "@/types/enums/ChatType";
import logFormData from "@/utils/logFormdata";

export const groupChatService = {
  // Create a new Group/Channel
  async createGroupChat(payload: {
    name: string;
    userIds: string[];
    type: ChatType.GROUP | ChatType.CHANNEL;
  }): Promise<ChatResponse> {
    const response = await API.post<ApiSuccessResponse<ChatResponse>>(
      "/chat/group",
      payload
    );
    return response.data.payload;
  },

  async getGroupChatById(groupChatId: string): Promise<ChatResponse> {
    const response = await API.get<ApiSuccessResponse<ChatResponse>>(
      `/chat/${groupChatId}`
    );
    return response.data.payload;
  },

  /**
   * Upload avatar image file only
   * @param avatarFile - File object of the avatar image
   */
  async uploadAvatar(avatarFile: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    logFormData(formData);

    try {
      const { data } = await API.post("/uploads/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      if (!data?.url) {
        throw new Error("Upload failed: No URL returned");
      }

      return data; // 👈 Return full object if it's { url: string }
    } catch (error: unknown) {
      console.error("uploadAvatar failed:", error);
      throw new Error("Image upload failed");
    }
  },

  async updateGroupChat(
    chatId: string,
    payload: Partial<ChatResponse>
  ): Promise<ChatResponse> {
    const response = await API.put<ApiSuccessResponse<ChatResponse>>(
      `/chat/${chatId}`,
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
