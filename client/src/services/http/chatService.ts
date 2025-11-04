import API from "@/services/api/api";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { UpdateChatRequest } from "@/shared/types/requests/update-chat.request";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import type { ChatResponse } from "@/shared/types/responses/chat.response";
import type {
  ApiSuccessResponse,
  DirectChatApiResponse,
} from "@/shared/types/responses/api-success.response";

export const chatService = {
  // Get all direct and group chats

  async fetchMoreChats(
    query?: PaginationQuery
  ): Promise<PaginationResponse<ChatResponse>> {
    const { data } = await API.get(`/chat/more`, {
      params: query,
    });

    const { items, hasMore } = data.payload;
    return { items, hasMore };
  },

  // Get a specific chat by ID
  async fetchChatById(chatId: string): Promise<ChatResponse> {
    const response = await API.get<ApiSuccessResponse<ChatResponse>>(
      `/chat/${chatId}`
    );
    return response.data.payload;
  },

  async fetchSavedChat(): Promise<ChatResponse> {
    const response = await API.get<ApiSuccessResponse<ChatResponse>>(
      `/chat/saved`
    );
    return response.data.payload;
  },

  async createOrGetDirectChat(
    partnerId: string
  ): Promise<DirectChatApiResponse> {
    const response = await API.post<DirectChatApiResponse>("/chat/direct", {
      partnerId,
    });
    return response.data;
  },

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

  async updateChat(payload: UpdateChatRequest): Promise<ChatResponse> {
    const chatId = payload.chatId;

    const response = await API.put<ApiSuccessResponse<ChatResponse>>(
      `/chat/${chatId}`,
      payload
    );

    return response.data.payload;
  },

  async deleteChat(chatId: string): Promise<string> {
    const response = await API.delete<ApiSuccessResponse<string>>(
      `/chat/${chatId}`
    );
    return response.data.payload;
  },

  async joinChatWithInvite(
    token: string
  ): Promise<{ chatId: string; message: string }> {
    const validToken = token.split("/").pop()?.trim();
    if (!validToken || validToken.includes("/")) {
      throw new Error("Invalid token format");
    }

    const response = await API.post<{
      payload: string;
      message: string;
    }>(`/invite/join/${validToken}`);

    const chatId = response.data.payload;
    const message = response.data.message;
    return { chatId, message };
  },

  async generateInviteLink(
    chatId: string,
    options?: { expiresAt?: string; maxUses?: number }
  ): Promise<string> {
    const response = await API.post<ApiSuccessResponse<string>>(
      `/invite/${chatId}`,
      {
        expiresAt: options?.expiresAt,
        maxUses: options?.maxUses,
      }
    );
    return response.data.payload;
  },

  async refreshInviteLink(token: string): Promise<string> {
    const validToken = token.split("/").pop()?.trim();
    if (!validToken || validToken.includes("/")) {
      throw new Error("Invalid token format");
    }

    const response = await API.post<ApiSuccessResponse<string>>(
      `/invite/refresh/${validToken}`
    );
    return response.data.payload;
  },
};
