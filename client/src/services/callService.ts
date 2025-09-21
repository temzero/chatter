import API from "./api/api";
import { handleError } from "@/utils/handleError";
import { CallResponseDto } from "@/types/responses/call.response";
import { IncomingCallResponse } from "@/types/callPayload";
import { generateLiveKitTokenRequest } from "@/types/requests/generate-livekit-token.request";

export const callService = {
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

      console.log("[generateAndFetchLiveKitToken] sending payload:", payload);

      const { data } = await API.post("/calls/token", payload);

      console.log("[generateAndFetchLiveKitToken] server response:", data);

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

  async fetchCallHistory(): Promise<CallResponseDto[]> {
    const { data } = await API.get(`/calls/history/`);
    return data.payload ?? data;
  },
};
