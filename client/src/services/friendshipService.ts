import API from "@/services/api/api";
import { FriendRequestResDto, FriendshipResDto } from "@/types/friendship";
import { FriendshipStatus } from "@/types/enums/friendshipType";

export const friendshipService = {
  /**
   * Send a friend request to a receiver by ID
   * @param receiverId - User ID to send request to
   */
  async sendRequest(receiverId: string, requestMessage: string): Promise<string> {
    const { data } = await API.post(`/friendships/requests/${receiverId}`, {
      requestMessage
    });
    return data.payload.status;
  },

  /**
   * Respond to a friend request by friendship ID
   * @param friendshipId - Friend request ID
   * @param status - Response status ('accepted' or 'rejected' etc.)
   */
  async respondToRequest(
    friendshipId: string,
    status: FriendshipStatus
  ): Promise<FriendshipResDto> {
    const { data } = await API.patch(`/friendships/requests/${friendshipId}`, {
      status,
    });
    return data.payload;
  },

  /**
   * Get all friends of the current user
   */
  async getFriends(): Promise<FriendshipResDto[]> {
    const { data } = await API.get("/friendships");
    return data.payload;
  },

  /**
   * Get all pending friend requests for the current user
   */
  async getPendingRequests(): Promise<FriendRequestResDto> {
    const { data } = await API.get("/friendships/requests/pending");
    console.log('request: ', data.payload)
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
};
