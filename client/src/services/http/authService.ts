import API from "@/services/api/api";
// import rawAPI from "@/services/api/rawApi";
import { localStorageService } from "@/services/storage/localStorageService";
import { AuthResponse } from "@/shared/types/responses/auth.response";
import {
  LoginRequest,
  RegisterRequest,
} from "@/shared/types/requests/auth.request";
import { ApiSuccessResponse } from "@/shared/types/responses/api-success.response";
import { UserResponse } from "@/shared/types/responses/user.response";

export const authService = {
  async fetchCurrentUser(): Promise<UserResponse> {
    console.log("[AUTH]", "fetchCurrentUser");
    const response = await API.get<ApiSuccessResponse<UserResponse>>(
      "/user/me"
    );
    return response.data.payload; // unwrap payload
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await API.post<AuthResponse>("/auth/login", payload, {
      withCredentials: true, // important for cookie
    });
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await API.post<AuthResponse>("/auth/register", payload, {
      withCredentials: true, // important for cookie
    });
    return data;
  },

  async sendPasswordResetEmail(email: string) {
    const { data } = await API.post("/auth/send-password-reset-email", {
      email,
    });
    return data;
  },

  async resetPasswordWithToken(token: string, newPassword: string) {
    const { data } = await API.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return data;
  },

  async verifyEmailWithToken(token: string) {
    const { data } = await API.get(
      `/auth/verify-email?token=${encodeURIComponent(token)}`
    );
    return data;
  },

  async refreshAccessToken(): Promise<string> {
    const response = await API.post<AuthResponse>(
      "/auth/refresh",
      {},
      { withCredentials: true } // Include COOKIE in request and allow SET COOKIE in response
    );
    return response.data.accessToken;
  },

  async logout(): Promise<void> {
    // Clear local access tokens
    localStorageService.clearAuth();

    // Call server to clear refresh token cookie
    const response = await API.post(
      "/auth/logout",
      {}, // empty body
      { withCredentials: true } // include cookies in request/response
    );

    return response.data;
  },
};
