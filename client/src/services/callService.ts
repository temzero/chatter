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
    const { data } = await API.post("/calls/token", {
      roomName,
      memberId,
      participantName,
    });

    return data.token;
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
