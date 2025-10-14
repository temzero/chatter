import API from "../api/api";
import type { ChatResponse } from "@/shared/types/responses/chat.response";
import { directChatService } from "./directChatService";
import { groupChatService } from "./groupChatService";
import type { ApiSuccessResponse } from "@/shared/types/responses/api-success.response";
import { toast } from "react-toastify";
import { handleError } from "@/utils/handleError";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import InitialDataResponse from "@/shared/types/responses/initial-data.response";

export const chatService = {
  ...directChatService,
  ...groupChatService,
  // Get all direct and group chats
  async fetchInitialData(
    chatLimit = 20,
    messageLimit = 20
  ): Promise<InitialDataResponse | null> {
    try {
      const response = await API.get<ApiSuccessResponse<InitialDataResponse>>(
        "/chat/initial",
        {
          params: { chatLimit, messageLimit },
        }
      );

      return response.data.payload;
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error("Failed to load initial chat data");
      return null;
    }
  },

  async fetchChats(
    options: PaginationQuery = { limit: 10 }
  ): Promise<{ chats: ChatResponse[]; hasMore: boolean }> {
    try {
      const { offset, lastId, limit } = options;

      const { data } = await API.get(`/chat`, {
        params: {
          ...(offset !== undefined ? { offset } : {}),
          ...(lastId ? { lastId } : {}),
          limit,
        },
      });

      const { chats, hasMore } = data.payload;
      return { chats, hasMore };
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      return { chats: [], hasMore: false };
    }
  },

  // Get a specific chat by ID
  async fetchChatById(chatId: string): Promise<ChatResponse> {
    toast.info("Fetch chat");
    const response = await API.get<ApiSuccessResponse<ChatResponse>>(
      `/chat/${chatId}`
    );
    return response.data.payload;
  },

  async fetchSavedChat(): Promise<ChatResponse> {
    try {
      const response = await API.get<ApiSuccessResponse<ChatResponse>>(
        `/chat/saved`
      );
      return response.data.payload;
    } catch (error) {
      console.error("Failed to fetch saved chat:", error);
      throw new Error("Unable to fetch saved chat.");
    }
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
    try {
      const response = await API.post<ApiSuccessResponse<string>>(
        `/invite/${chatId}`,
        {
          expiresAt: options?.expiresAt,
          maxUses: options?.maxUses,
        }
      );
      toast.success("Invite link created!");
      return response.data.payload;
    } catch (error) {
      handleError(error, "Could not generate invite link");
      throw error;
    }
  },

  async refreshInviteLink(token: string): Promise<string> {
    const validToken = token.split("/").pop()?.trim();
    if (!validToken || validToken.includes("/")) {
      throw new Error("Invalid token format");
    }

    try {
      const response = await API.post<ApiSuccessResponse<string>>(
        `/invite/refresh/${validToken}`
      );
      toast.success("Invite link refreshed!");
      return response.data.payload;
    } catch (error) {
      handleError(error, "Could not refresh invite link");
      throw error;
    }
  },
};
