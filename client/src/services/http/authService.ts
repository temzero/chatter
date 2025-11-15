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
import { toast } from "react-toastify";

export const authService = {
  async fetchCurrentUser(): Promise<UserResponse> {
    console.log("[AUTH]", "fetchCurrentUser");
    const response = await API.get<ApiSuccessResponse<UserResponse>>(
      "/user/me"
    );
    return response.data.payload; // unwrap payload
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await API.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await API.post<AuthResponse>("/auth/register", payload);
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
    toast.info("[AUTH] RefreshToken");
    console.log("[AUTH]", "refreshToken");
    const response = await API.post<AuthResponse>("/auth/refresh");
    return response.data.accessToken;
  },

  logout: async () => {
    localStorageService.clearAuth();
    const response = await API.post("/auth/logout");
    return response.data;
  },
};
