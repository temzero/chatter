import API from "@/services/api/api";
import { MyProfileProps } from "@/data/types";

export const userService = {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<MyProfileProps[]> {
    const { data } = await API.get("/user");
    return data.data;
  },

  /**
   * Get user by ID
   * @param id - User ID
   */
  async getUserById(userId: string): Promise<MyProfileProps> {
    const { data } = await API.get(`/user/${userId}`);
    return data.data;
  },

  /**
   * Get user by identifier (username, email, or phone)
   * @param identifier - Username, email, or phone
   */
  async getUserByIdentifier(identifier: string): Promise<MyProfileProps> {
    const { data } = await API.get(`/user/find/${identifier}`);
    return data.data;
  },

  /**
   * Create a new user
   * @param userData - User creation data
   */
  async createUser(userData: Partial<MyProfileProps>): Promise<MyProfileProps> {
    const { data } = await API.post("/user/create", userData);
    return data.data;
  },

  /**
   * Update an existing user
   * @param userId - User ID
   * @param updatedData - Data to update
   */
  async updateUser(userId: string, updatedData: Partial<MyProfileProps>): Promise<MyProfileProps> {
    const { data } = await API.put(`/user/${userId}`, updatedData);
    return data.data;
  },

  /**
   * Delete a user by ID
   * @param userId - User ID
   */
  async deleteUser(userId: string): Promise<string> {
    const { data } = await API.delete(`/user/${userId}`);
    return data.data;
  },

  async sendFriendRequest(requestData: {
    recipientId: string;
    message: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const { data } = await API.post("/friend-request", requestData);
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Failed to send friend request:", error);
      let errorMessage = "Failed to send friend request";
      
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        errorMessage = err.response?.data?.message || errorMessage;
      }
      return { 
        success: false, 
        message: errorMessage
      };
    }
  },

  // You might also want to add these related methods:
  /**
   * Get pending friend requests
   */
  async getFriendRequests(): Promise<unknown[]> {
    const { data } = await API.get("/friend-request");
    return data.data;
  },

  /**
   * Respond to a friend request
   * @param requestId - Friend request ID
   * @param accept - Whether to accept or reject
   */
  async respondToFriendRequest(requestId: string, accept: boolean): Promise<unknown> {
    const { data } = await API.put(`/friend-request/${requestId}`, { accept });
    return data.data;
  }
};
