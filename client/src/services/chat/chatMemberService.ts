import API from "../api/api";
import type { ChatMember } from "@/types/chat";
import type { ApiSuccessResponse } from "@/types/apiSuccessResponse";

export const chatMemberService = {
  // Get all members of a chat
  async fetchChatMembers(chatId: string): Promise<ChatMember[]> {
    const response = await API.get<ApiSuccessResponse<ChatMember[]>>(
      `/chat-members/${chatId}`
    );
    return response.data.payload;
  },

  // Get a specific member of a chat
  async getMemberByChatIdAndUserId(chatId: string, userId: string): Promise<ChatMember> {
    const response = await API.get<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${chatId}/${userId}`
    );
    return response.data.payload;
  },

  async getMember(memberId: string): Promise<ChatMember> {
    const response = await API.get<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${memberId}`
    );
    return response.data.payload;
  },

  // Add a new member to a chat
  async addMember(
    chatId: string,
    userId: string,
    role?: string
  ): Promise<ChatMember> {
    const response = await API.post<ApiSuccessResponse<ChatMember>>(
      `/chat-members`,
      { chatId, userId, role }
    );
    return response.data.payload;
  },

  // Update a chat member
  async updateMember(
    chatId: string,
    userId: string,
    updates: { role?: string; mutedUntil?: Date }
  ): Promise<ChatMember> {
    const response = await API.patch<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${chatId}/${userId}`,
      updates
    );
    return response.data.payload;
  },

  async updateMemberNickname(
    chatId: string,
    userId: string,
    nickname: string
  ): Promise<string> {
    const response = await API.patch<ApiSuccessResponse<string>>(
      `/chat-members/nickname/${chatId}/${userId}`,
      { nickname }
    );
    // return nickname: string
    return response.data.payload;
  },

  // Either implement in controller or remove:
  async updateLastRead(chatMemberId: string): Promise<void> {
    await API.patch("/messages/last-read", { chatMemberId });
  },

  // Remove a member from a chat
  async removeMember(chatId: string, userId: string): Promise<ChatMember> {
    const response = await API.delete<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${chatId}/${userId}`
    );
    return response.data.payload;
  },
};
