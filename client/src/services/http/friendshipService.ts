import API from "@/services/api/api";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { FriendContactResponse } from "@/shared/types/responses/friend-contact.response";
import {
  FriendshipResponse,
  FriendRequestResponse,
  FriendshipUpdateNotification,
} from "@/shared/types/responses/friendship.response";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";

export const friendshipService = {
  /**
   * Get all pending friend requests for the current user
   */
  async fetchPendingRequests(
    query?: PaginationQuery
  ): Promise<PaginationResponse<FriendRequestResponse>> {
    const { data } = await API.get("/friendships/requests/pending", {
      params: query,
    });

    return data.payload; // matches SuccessResponse<PaginationResponse<FriendRequestResponse>>
  },

  /**
   * Get all friends of the current user
   */
  async fetchFriendContacts(): Promise<FriendContactResponse[]> {
    const { data } = await API.get("/friendships/contacts");
    console.log("Friend contacts", data.payload);
    return data.payload;
  },

  /**
   * Get friendship status between current user and another user
   * @param otherUserId - The other user's ID
   */
  async fetchFriendshipStatus(
    otherUserId: string
  ): Promise<{ status: FriendshipStatus | null }> {
    const { data } = await API.get(`/friendships/status/${otherUserId}`);
    return data.payload;
  },

  /**
   * Send a friend request to a receiver by ID
   * @param receiverId - User ID to send request to
   */
  async sendRequest(
    receiverId: string,
    requestMessage: string | undefined
  ): Promise<FriendRequestResponse> {
    const { data } = await API.post(
      `/friendships/requests/send/${receiverId}`,
      {
        requestMessage,
      }
    );
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
    const { data } = await API.patch(
      `/friendships/requests/response/${friendshipId}`,
      {
        status,
      }
    );
    return data.payload;
  },

  /**
   * delete to a friend request by friendship ID
   * @param friendshipId - Friend request ID
   */
  async cancelRequest(
    friendshipId: string,
    userId?: string
  ): Promise<FriendshipResponse> {
    const { data } = await API.delete(
      `/friendships/cancel/${friendshipId}/${userId}`
    );
    return data.payload;
  },

  async deleteByUserId(userId: string): Promise<FriendshipResponse> {
    const { data } = await API.delete(`/friendships/by-userid/${userId}`);
    return data.payload;
  },
};
