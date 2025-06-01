import API from "@/services/api/api";
import { otherUser, User } from "@/types/user";
import { ProfileFormData } from "@/components/sidebar/SidebarProfileEdit";

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
  async getUserByIdentifier(identifier: string): Promise<otherUser> {
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
  async updateProfile(updatedProfile: ProfileFormData) {
    try {
      const { data } = await API.put("/user/profile", updatedProfile);
      console.log("Profile updated successfully:", data.payload);
      return data.payload;
    } catch (error: unknown) {
      console.error("updateProfile failed:", error);
      throw new Error("Profile update failed");
    }
  },
  /**
   * Update the currently authenticated user
   * @param updatedData - Data to update
   */
  async updateUser(updatedData: FormData): Promise<User> {
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
};
