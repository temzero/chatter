import API from "@/services/api/api";
import { User } from "@/types/user";

export const userService = {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const { data } = await API.get("/user");
    return data.payload;
  },

  /**
   * Get user by ID
   * @param userId - User ID
   */
  async getUserById(userId: string): Promise<User> {
    const { data } = await API.get(`/user/${userId}`);
    return data.payload;
  },

  /**
   * Get user by identifier (username, email, or phone)
   * @param identifier - Username, email, or phone
   */
  async getUserByIdentifier(identifier: string): Promise<User> {
    const { data } = await API.get(`/user/find/${identifier}`);
    return data.payload;
  },

  /**
   * Create a new user
   * @param userData - User creation data
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const { data } = await API.post("/user/create", userData);
    return data.payload;
  },

  /**
   * Update the currently authenticated user
   * @param updatedProfile - Data to update
   */
  async updateProfile(updatedProfile: Partial<User>): Promise<User> {
    const { data } = await API.put("/user/profile", updatedProfile);
    return data.payload;
  },

  /**
   * Update the currently authenticated user
   * @param updatedData - Data to update
   */
  async updateUser(updatedData: Partial<User>): Promise<User> {
    const { data } = await API.put("/user", updatedData);
    return data.payload;
  },

  /**
   * Delete the currently authenticated user
   */
  async deleteUser(): Promise<string> {
    const { data } = await API.delete("/user"); // ✅ no userId in URL
    return data.payload;
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
        message: errorMessage,
      };
    }
  },

  /**
   * Get pending friend requests
   */
  async getFriendRequests(): Promise<unknown[]> {
    const { data } = await API.get("/friend-request");
    return data.payload;
  },

  /**
   * Respond to a friend request
   * @param requestId - Friend request ID
   * @param accept - Whether to accept or reject
   */
  async respondToFriendRequest(
    requestId: string,
    accept: boolean
  ): Promise<unknown> {
    const { data } = await API.put(`/friend-request/${requestId}`, { accept });
    return data.payload;
  },
};
