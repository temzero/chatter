import API from "@/services/api/api";
import { CreateBlockRequest } from "@/shared/types/requests/create-block.request";
import { BlockResponse } from "@/shared/types/responses/block.response";

export const blockService = {
  async blockUser({
    blockedId,
    reason,
  }: CreateBlockRequest): Promise<BlockResponse> {
    const { data } = await API.post("/block", {
      blockedId,
      reason,
    });
    return data.payload;
  },

  /**
   * Unblock a user
   * @param blockedId - ID of the user to unblock
   */
  async unblockUser(blockedId: string): Promise<BlockResponse> {
    const { data } = await API.delete(`/block/${blockedId}`);
    return data.payload;
  },

  /**
   * Get all users blocked by the current user
   */
  async fetchAllBlockedUsers(): Promise<BlockResponse[]> {
    const { data } = await API.get("/block");
    return data.payload;
  },
};
