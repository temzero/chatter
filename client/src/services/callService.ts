import API from "./api/api";

export const callService = {
  /**
   * Request a LiveKit token from backend
   */
  async getToken(
    roomName: string,
    memberId: string,
    participantName?: string
  ): Promise<string> {
    const { data } = await API.post("/call/token", {
      roomName,
      memberId,
      participantName,
    });

    return data.token;
  },

  /**
   * (Optional) Fetch call history
   */
  async getCallHistory(chatId: string) {
    const { data } = await API.get(`/call/history/${chatId}`);
    return data;
  },

  /**
   * (Optional) End/leave a call
   */
  async endCall(callId: string) {
    await API.post(`/call/${callId}/end`);
  },
};
