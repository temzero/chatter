import API from "./api/api";
import { handleError } from "@/utils/handleError";
import { CallStatus } from "@/types/enums/CallStatus"; // Import the enum
import { CallResponseDto } from "@/types/responses/call.response";
import { IncomingCallResponse } from "@/types/callPayload";

export const callService = {
  /**
   * Request a LiveKit token from backend
   */
  // Frontend
  async getToken(
    roomName: string,
    participantName?: string,
    avatarUrl?: string
  ): Promise<string | undefined> {
    try {
      const { data } = await API.post("/calls/token", {
        roomName,
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

  async getPendingCalls(): Promise<IncomingCallResponse[]> {
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
  async getCallHistory(): Promise<CallResponseDto[]> {
    const { data } = await API.get(`/calls/history/`);
    return data.payload ?? data;
  },

  /**
   * Get a specific call by ID
   */
  async getCallById(callId: string): Promise<CallResponseDto> {
    const { data } = await API.get(`/calls/${callId}`);
    return data.payload ?? data;
  },

  /**
   * Generic call update - use for any status change
   */
  async updateCall(
    callId: string,
    updateData: {
      status?: CallStatus;
      endedAt?: string;
      // Add other fields you might want to update
    }
  ): Promise<CallResponseDto> {
    const { data } = await API.patch(`/calls/${callId}`, updateData);
    return data.payload ?? data;
  },

  /**
   * End a call (sets status to COMPLETED)
   */
  async endCall(callId: string): Promise<CallResponseDto> {
    const { data } = await API.post(`/calls/${callId}/end`);
    return data.payload ?? data;
  },

  /**
   * Mark call as missed (sets status to MISSED)
   */
  async markCallAsMissed(callId: string): Promise<CallResponseDto> {
    return this.updateCall(callId, {
      status: CallStatus.MISSED,
      endedAt: new Date().toISOString(),
    });
  },

  /**
   * Mark call as failed (sets status to FAILED)
   */
  async markCallAsFailed(callId: string): Promise<CallResponseDto> {
    return this.updateCall(callId, {
      status: CallStatus.FAILED,
      endedAt: new Date().toISOString(),
    });
  },

  /**
   * Mark call as declined (sets status to DECLINED)
   * Useful if you want to update status from caller's perspective after being rejected
   */
  async markCallAsDeclined(callId: string): Promise<CallResponseDto> {
    return this.updateCall(callId, {
      status: CallStatus.DECLINED,
      endedAt: new Date().toISOString(),
    });
  },

  /**
   * Delete a call (e.g., when caller cancels before it's answered)
   */
  async deleteCall(callId: string): Promise<void> {
    await API.delete(`/calls/${callId}`);
  },
};
