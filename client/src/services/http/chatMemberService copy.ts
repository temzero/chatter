import API from "@/services/api/api";
import type { ApiSuccessResponse } from "@/shared/types/responses/api-success.response";
import { UpdateChatMemberRequest } from "@/shared/types/requests/update-chat-member.request";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";

export const chatMemberService = {
  // Get direct chat members
  async fetchDirectChatMembers(chatId: string): Promise<ChatMemberResponse[]> {
    const response = await API.get<ApiSuccessResponse<ChatMemberResponse[]>>(
      `/chat-members/direct/${chatId}`
    );
    return response.data.payload;
  },
  // Get group chat members
  async fetchGroupChatMembers(chatId: string): Promise<ChatMemberResponse[]> {
    const response = await API.get<ApiSuccessResponse<ChatMemberResponse[]>>(
      `/chat-members/group/${chatId}`
    );
    return response.data.payload;
  },

  async fetchMemberById(memberId: string): Promise<ChatMemberResponse> {
    const response = await API.get<ApiSuccessResponse<ChatMemberResponse>>(
      `/chat-members/${memberId}`
    );
    return response.data.payload;
  },

  // Get a specific member by chatId and userId
  async fetchMemberByChatIdAndUserId(
    chatId: string,
    userId: string
  ): Promise<ChatMemberResponse> {
    const response = await API.get<ApiSuccessResponse<ChatMemberResponse>>(
      `/chat-members/chat/${chatId}/user/${userId}`
    );
    return response.data.payload;
  },

  // Add a new member
  async addMembers(
    chatId: string,
    userIds: string[]
  ): Promise<ChatMemberResponse> {
    const response = await API.post<ApiSuccessResponse<ChatMemberResponse>>(
      `/chat-members`,
      { chatId, userIds }
    );
    return response.data.payload;
  },

  async joinChat(chatId: string): Promise<ChatMemberResponse> {
    const response = await API.post<ApiSuccessResponse<ChatMemberResponse>>(
      `/chat-members/join/${chatId}`
    );
    return response.data.payload;
  },

  // Update a chat member
  async updateMember(
    memberId: string,
    updates: UpdateChatMemberRequest
  ): Promise<ChatMemberResponse> {
    const response = await API.patch<ApiSuccessResponse<ChatMemberResponse>>(
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
    messageId: string | null
  ): Promise<ChatMemberResponse> {
    const response = await API.patch<ApiSuccessResponse<ChatMemberResponse>>(
      `/chat-members/last-read/${memberId}/${messageId}`
    );
    return response.data.payload;
  },

  async pinChat(
    myMemberId: string,
    isPin: boolean
  ): Promise<ChatMemberResponse> {
    const response = await API.patch<ApiSuccessResponse<ChatMemberResponse>>(
      `/chat-members/pin/${myMemberId}`,
      { isPinned: isPin }
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
  async softDeleteMember(
    chatId: string,
    userId: string
  ): Promise<{ chatDeleted: boolean }> {
    const response = await API.delete<
      ApiSuccessResponse<{ chatDeleted: boolean }>
    >(`/chat-members/soft-delete/${chatId}/${userId}`);
    return response.data.payload;
  },

  async DeleteMember(
    chatId: string,
    userId: string
  ): Promise<{ chatDeleted: boolean }> {
    const response = await API.delete<
      ApiSuccessResponse<{ chatDeleted: boolean }>
    >(`/chat-members/${chatId}/${userId}`);
    return response.data.payload;
  },
};
