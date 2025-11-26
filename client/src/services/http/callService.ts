import API from "@/services/api/api";
import { CallResponse } from "@/shared/types/responses/call.response";
import { IncomingCallResponse } from "@shared/types/call";
import { generateLiveKitTokenRequest } from "@/shared/types/requests/generate-livekit-token.request";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";

export const callService = {
  async fetchCallHistory(
    query?: PaginationQuery
  ): Promise<{ calls: CallResponse[]; hasMore: boolean }> {
    const { data } = await API.get(`/calls/history`, {
      params: query,
    });

    const { calls, hasMore } = data.payload;
    return { calls, hasMore };
  },

  async fetchActiveCall(chatId: string): Promise<IncomingCallResponse> {
    const { data } = await API.get(`/calls/active/${chatId}`);
    return data.payload ?? data;
  },

  async fetchPendingCalls(): Promise<IncomingCallResponse[]> {
    try {
      const { data } = await API.get(`/calls/pending`);
      // Adjust based on your API response structure
      return data.payload ?? data;
    } catch (error) {
      console.error("Failed to fetch pending calls:", error);
      throw error;
    }
  },

  // async fetchActiveCall(chatId: string): Promise<void> {
  //   console.log("Fetching active call for chatId:", chatId);
  // },
  // async fetchPendingCalls() {},

  async generateAndFetchLiveKitToken(
    payload: generateLiveKitTokenRequest
  ): Promise<string> {
    const { data } = await API.post("/calls/token", payload);
    if (!data.payload?.token) {
      throw new Error("No token returned from server");
    }

    return data.payload.token;
  },

  async deleteCall(callId: string): Promise<void> {
    await API.delete(`/calls/${callId}`);
  },
};
