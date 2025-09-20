import API from "./api/api";
import { handleError } from "@/utils/handleError";
import { CallResponseDto } from "@/types/responses/call.response";
import { IncomingCallResponse } from "@/types/callPayload";

export const callService = {
  /**
   * Request a LiveKit token from backend
   */
  // Frontend
  async fetchLiveKitToken(
    chatId: string,
    participantName?: string,
    avatarUrl?: string
  ): Promise<string | undefined> {
    try {
      const { data } = await API.post("/calls/token", {
        chatId,
        participantName,
        avatarUrl,
      });

      if (!data.payload?.token) {
        throw new Error("No token returned from server");
      }

      return data.payload.token;
    } catch (error) {
      handleError(error, "Cannot get SFU liveKit token");
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

  /**
   * Fetch calls history
   */
  async fetchCallHistory(): Promise<CallResponseDto[]> {
    const { data } = await API.get(`/calls/history/`);
    return data.payload ?? data;
  },
};
