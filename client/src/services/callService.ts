import API from "./api/api";
import { handleError } from "@/utils/handleError";
import { CallResponseDto } from "@/types/responses/call.response";
import { IncomingCallResponse } from "@/types/callPayload";
import { generateLiveKitTokenRequest } from "@/types/requests/generate-livekit-token.request";

export const callService = {
  async fetchCallHistory(
    limit = 20,
    offset = 0
  ): Promise<{ calls: CallResponseDto[]; hasMore: boolean }> {
    const { data } = await API.get(
      `/calls/history?limit=${limit}&offset=${offset}`
    );
    return data.payload ?? { calls: [], hasMore: false };
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

  async generateAndFetchLiveKitToken(
    chatId: string,
    participantName?: string,
    avatarUrl?: string
  ): Promise<string | undefined> {
    try {
      const payload: generateLiveKitTokenRequest = {
        chatId,
        participantName: participantName ?? null,
        avatarUrl: avatarUrl ?? null,
      };

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
