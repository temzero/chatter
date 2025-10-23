import API from "@/services/api/api";
import { handleError } from "@/common/utils/handleError";
import { CallResponse } from "@/shared/types/responses/call.response";
import { IncomingCallResponse } from "@shared/types/call";
import { generateLiveKitTokenRequest } from "@/shared/types/requests/generate-livekit-token.request";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";

export const callService = {
  async fetchCallHistory(
    queries: PaginationQuery
  ): Promise<{ calls: CallResponse[]; hasMore: boolean }> {
    try {
      const { data } = await API.get(`/calls/history`, {
        params: queries,
      });

      const { calls, hasMore } = data.payload;
      return { calls, hasMore };
    } catch (error) {
      console.error("Failed to fetch call history:", error);
      return { calls: [], hasMore: false };
    }
  },

  async fetchActiveCall(chatId: string): Promise<IncomingCallResponse> {
    try {
      const { data } = await API.get(`/calls/active/${chatId}`);
      return data.payload ?? data;
    } catch (error) {
      console.error("Failed to fetch pending calls:", error);
      throw error;
    }
  },

  // async fetchPendingCalls(): Promise<IncomingCallResponse[]> {
  //   try {
  //     const { data } = await API.get(`/calls/pending`);
  //     // Adjust based on your API response structure
  //     return data.payload ?? data;
  //   } catch (error) {
  //     console.error("Failed to fetch pending calls:", error);
  //     throw error;
  //   }
  // },
  async fetchPendingCalls() {},

  async generateAndFetchLiveKitToken(
    payload: generateLiveKitTokenRequest
  ): Promise<string | undefined> {
    try {
      const { data } = await API.post("/calls/token", payload);
      if (!data.payload?.token) {
        throw new Error("No token returned from server");
      }

      return data.payload.token;
    } catch (error) {
      console.error("[generateAndFetchLiveKitToken] error:", error);
      handleError(error, "Cannot get SFU liveKit token");
      return undefined;
    }
  },

  async deleteCall(callId: string): Promise<void> {
    try {
      await API.delete(`/calls/${callId}`);
    } catch (error) {
      console.error("[deleteCall] Error:", error);
      throw error;
    }
  },
};
