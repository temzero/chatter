import API from "../api/api";
import {
  DirectChatMember,
  GroupChatMember,
  ChatMember,
} from "@/types/responses/chatMember.response";
import type { ApiSuccessResponse } from "@/types/responses/apiSuccess.response";

export const chatMemberService = {
  // Get direct chat members
  async fetchDirectChatMembers(chatId: string): Promise<DirectChatMember[]> {
    const response = await API.get<ApiSuccessResponse<DirectChatMember[]>>(
      `/chat-members/direct/${chatId}`
    );
    return response.data.payload;
  },
  // Get group chat members
  async fetchGroupChatMembers(chatId: string): Promise<GroupChatMember[]> {
    const response = await API.get<ApiSuccessResponse<GroupChatMember[]>>(
      `/chat-members/group/${chatId}`
    );
    return response.data.payload;
  },

  // Get a specific member by chatId and userId
  async getMemberByChatIdAndUserId(
    chatId: string,
    userId: string
  ): Promise<ChatMember> {
    const response = await API.get<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${chatId}/${userId}`
    );
    return response.data.payload;
  },

  // // Get a member by memberId
  // async getMember(memberId: string): Promise<ChatMember> {
  //   const response = await API.get<ApiSuccessResponse<ChatMember>>(
  //     `/chat-members/${memberId}`
  //   );
  //   return response.data.payload;
  // },

  // Add a new member
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
    memberId: string,
    updates: Partial<ChatMember>
  ): Promise<ChatMember> {
    const response = await API.patch<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${memberId}`,
      updates
    );
    return response.data.payload;
  },

  // Update nickname
  async updateMemberNickname(
    memberId: string,
    nickname: string
  ): Promise<string> {
    const response = await API.patch<ApiSuccessResponse<string>>(
      `/chat-members/nickname/${memberId}`,
      { nickname }
    );
    return response.data.payload;
  },

  // Update last read message
  async updateLastRead(
    memberId: string,
    messageId: string
  ): Promise<ChatMember> {
    const response = await API.patch<ApiSuccessResponse<ChatMember>>(
      `/chat-members/last-read/${memberId}/${messageId}`
    );
    return response.data.payload;
  },

  async setMute(
    myMemberId: string,
    mutedUntil: string | Date | null
  ): Promise<Date | null> {
    const response = await API.patch<ApiSuccessResponse<Date | null>>(
      `/chat-members/mute/${myMemberId}`,
      { mutedUntil }
    );
    return response.data.payload;
  },

  // Remove member using chatId and userId
  async removeMember(chatId: string, userId: string): Promise<ChatMember> {
    const response = await API.delete<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${chatId}/${userId}`
    );
    return response.data.payload;
  },
};
