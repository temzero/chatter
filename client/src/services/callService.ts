import { handleError } from "@/utils/handleError";
import { IncomingCallResponse } from "@/types/callPayload";
import API from "./api/api";

export const callService = {
  /**
   * Request a LiveKit token from backend
   */
  async getToken(
    roomName: string,
    memberId: string,
    participantName?: string
  ): Promise<string | undefined> {
    try {
      const { data } = await API.post("/calls/token", {
        roomName,
        memberId,
        participantName,
      });

      // Access token through data.payload.token instead of data.token
      if (!data.payload?.token) {
        throw new Error("No token returned from server");
      }

      return data.payload.token;
    } catch (error) {
      handleError(error, "Cannot get SFU liveKit token");
    }
  },

  async getPendingCalls(): Promise<IncomingCallResponse[]> {
    try {
      const { data } = await API.get(`/calls/pending`);
      return data;
    } catch (error) {
      console.error("Failed to fetch pending calls:", error);
      throw error;
    }
  },

  /**
   * (Optional) Fetch calls history
   */
  async getCallHistory(chatId: string) {
    const { data } = await API.get(`/calls/history/${chatId}`);
    return data;
  },

  /**
   * (Optional) End/leave a calls
   */
  async endCall(callId: string) {
    await API.post(`/calls/${callId}/end`);
  },
};
