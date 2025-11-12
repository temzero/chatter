import API from "@/services/api/api";
import { UserResponse } from "@/shared/types/responses/user.response";
import { ProfileFormData } from "@/components/sidebar/SidebarProfileEdit";

export const userService = {
  /**
   * Get user by identifier (username, email, or phone)
   * @param identifier - Username, email, or phone
   */
  async fetchUserByIdentifier(identifier: string): Promise<UserResponse> {
    const { data } = await API.get(`/user/find/${identifier}`);
    return data.payload;
  },

  /**
   * Update the currently authenticated user
   * @param updatedProfile - Data to update
   */
  async updateProfile(updatedProfile: ProfileFormData) {
    const { data } = await API.put("/user/profile", updatedProfile);
    return data.payload;
  },
  /**
   * Update the currently authenticated user
   * @param updatedData - Data to update
   */
  async updateUser(updatedData: FormData): Promise<UserResponse> {
    const { data } = await API.put("/user", updatedData);
    return data.payload;
  },

  /**
   * Update the currently authenticated user
   * @param updatedData - Data to update
   */
  async updateUsername(username: string): Promise<UserResponse> {
    const { data } = await API.put("/user/username", { username });
    return data.payload;
  },

  /**
   * Verify username availability
   * @param username - Username to verify
   */
  async verifyUsername(username: string) {
    const { data } = await API.post("/user/verify/username", { username });
    return data;
  },

  /**
   * Update the currently authenticated user
   * @param updatedData - Data to update
   */
  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await API.put("/user/password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  /**
   * Send OTP validation code to phone number
   * @param phoneNumber - Phone number to validate
   */
  async sendOTPValidation(phoneNumber: string) {
    const { data } = await API.post("/user/verify/phone/send", { phoneNumber });
    return data.payload;
  },

  /**
   * Send 6-digit verification code to email
   * @param email - Email address to verify
   * @throws {Error} If email is invalid or sending fails
   */
  async sendEmailVerificationCode(email: string): Promise<boolean> {
    const { data } = await API.post("/user/verify/email/send-code", {
      email,
    });
    return data.payload;
  },

  /**
   * Verify 6-digit code sent to email
   * @param email - Email address to verify
   * @param verificationCode - 6-digit verification code
   * @throws {Error} If verification fails
   */
  async updateEmailWithCode(
    email: string,
    verificationCode: string
  ): Promise<UserResponse> {
    // Validate code format before sending to server
    if (!/^\d{6}$/.test(verificationCode)) {
      throw new Error("Verification code must be 6 digits");
    }

    const { data } = await API.post("/user/verify/email/confirm-code", {
      email,
      verificationCode,
    });

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
