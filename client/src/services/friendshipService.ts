import API from "@/services/api/api";
import {
  FriendshipResponse,
  FriendRequestResponse,
  FriendshipUpdateNotification,
} from "@/types/responses/friendship.response";
import { FriendshipStatus } from "@/types/enums/friendshipType";

export const friendshipService = {
  /**
   * Send a friend request to a receiver by ID
   * @param receiverId - User ID to send request to
   */
  async sendRequest(
    receiverId: string,
    requestMessage: string | undefined
  ): Promise<FriendRequestResponse> {
    const { data } = await API.post(`/friendships/requests/${receiverId}`, {
      requestMessage,
    });
    return data.payload;
  },

  /**
   * Respond to a friend request by friendship ID
   * @param friendshipId - Friend request ID
   * @param status - Response status ('accepted' or 'rejected' etc.)
   */
  async respondToRequest(
    friendshipId: string,
    status: FriendshipStatus
  ): Promise<FriendshipUpdateNotification> {
    const { data } = await API.patch(`/friendships/requests/${friendshipId}`, {
      status,
    });
    return data.payload;
  },

  /**
   * Get all friends of the current user
   */
  async getFriends(): Promise<FriendshipResponse[]> {
    const { data } = await API.get("/friendships");
    return data.payload;
  },

  /**
   * Get all pending friend requests for the current user
   */
  async getPendingRequests(): Promise<FriendRequestResponse[]> {
    const { data } = await API.get("/friendships/requests/pending");
    return data.payload;
  },

  /**
   * Get friendship status between current user and another user
   * @param otherUserId - The other user's ID
   */
  async getFriendshipStatus(
    otherUserId: string
  ): Promise<{ status: FriendshipStatus | null }> {
    const { data } = await API.get(`/friendships/status/${otherUserId}`);
    return data.payload;
  },

  /**
   * delete to a friend request by friendship ID
   * @param friendshipId - Friend request ID
   */
  async deleteRequest(friendshipId: string, userId?: string): Promise<FriendshipResponse> {
    const { data } = await API.delete(`/friendships/${friendshipId}/${userId}`);
    return data.payload;
  },

  async deleteByUserId(userId: string): Promise<FriendshipResponse> {
    const { data } = await API.delete(`/friendships/by-userid/${userId}`);
    console.log("deleted: ", data);
    return data.payload;
  },
};
