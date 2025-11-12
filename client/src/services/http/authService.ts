import API from "@/services/api/api";
// import rawAPI from "@/services/api/rawApi";
import { localStorageService } from "@/services/storage/localStorageService";
import { AuthResponse } from "@/shared/types/responses/auth.response";
import {
  LoginRequest,
  RegisterRequest,
} from "@/shared/types/requests/auth.request";
import logger from "@/common/utils/logger";

export const authService = {
  async fetchCurrentUser() {
    const { data } = await API.get("/user/me");
    return data.payload;
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

  async refreshToken(): Promise<string> {
    logger.log({ prefix: "AUTH" }, "refreshToken");
    const response = await API.post<AuthResponse>("/auth/refresh");
    return response.data.accessToken;
  },

  logout: async () => {
    localStorageService.clearAuth();
    const response = await API.post("/auth/logout");
    return response.data;
  },
};
