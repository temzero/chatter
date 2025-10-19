import API from "./api/api";
import {
  DirectChatMember,
  GroupChatMember,
  ChatMember,
} from "@/shared/types/responses/chat-member.response";
import type { ApiSuccessResponse } from "@/shared/types/responses/api-success.response";
import { UpdateChatMemberRequest } from "@/shared/types/requests/update-chat-member.request";

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

  async fetchMemberById(memberId: string): Promise<ChatMember> {
    const response = await API.get<ApiSuccessResponse<ChatMember>>(
      `/chat-members/${memberId}`
    );
    return response.data.payload;
  },

  // Get a specific member by chatId and userId
  async fetchMemberByChatIdAndUserId(
    chatId: string,
    userId: string
  ): Promise<ChatMember> {
    const response = await API.get<ApiSuccessResponse<ChatMember>>(
      `/chat-members/chat/${chatId}/user/${userId}`
    );
    return response.data.payload;
  },

  // Add a new member
  async addMembers(chatId: string, userIds: string[]): Promise<ChatMember> {
    const response = await API.post<ApiSuccessResponse<ChatMember>>(
      `/chat-members`,
      { chatId, userIds }
    );
    return response.data.payload;
  },

  async joinChat(chatId: string): Promise<ChatMember> {
    const response = await API.post<ApiSuccessResponse<ChatMember>>(
      `/chat-members/join/${chatId}`
    );
    return response.data.payload;
  },

  // Update a chat member
  async updateMember(
    memberId: string,
    updates: UpdateChatMemberRequest
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
    messageId: string | null
  ): Promise<ChatMember> {
    const response = await API.patch<ApiSuccessResponse<ChatMember>>(
      `/chat-members/last-read/${memberId}/${messageId}`
    );
    return response.data.payload;
  },

  async pinChat(myMemberId: string, isPin: boolean): Promise<GroupChatMember> {
    const response = await API.patch<ApiSuccessResponse<GroupChatMember>>(
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
