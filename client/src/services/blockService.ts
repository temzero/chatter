// src/services/blockService.ts
import API from "@/services/api/api";
import { BlockResponseDto } from "@/shared/types/responses/block.response";
// import { CreateBlockDto } from "@/types/requests/create-block.dto";

export const blockService = {
  /**
   * Block a user
   * @param createBlockDto - Blocked user ID and optional reason
   */
  async blockUser({
    blockedId,
    reason,
  }: {
    blockedId: string;
    reason?: string;
  }): Promise<BlockResponseDto> {
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
  async unblockUser(blockedId: string): Promise<BlockResponseDto> {
    const { data } = await API.delete(`/block/${blockedId}`);
    return data.payload;
  },

  /**
   * Get all users blocked by the current user
   */
  async getAllBlockedUsers(): Promise<BlockResponseDto[]> {
    const { data } = await API.get("/block");
    return data.payload;
  },

  /**
   * Check if a specific user is blocked
   * @param blockedId - ID of the user to check
   */
  async getBlockStatus(blockedId: string): Promise<BlockResponseDto> {
    const { data } = await API.get(`/block/${blockedId}`);
    return data.payload;
  },
};
