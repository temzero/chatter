import API from "@/services/api/api";
import rawAPI from "./api/rawApi";
import { storageService } from "./storage/storageService";

export const authService = {
  async login(identifier: string, password: string) {
    const { data } = await API.post("/auth/login", {
      identifier,
      password,
    });
    storageService.setAccessToken(data.accessToken);
    storageService.setUser(data.user);
    return data;
  },

  async register(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    const { data } = await API.post("/auth/register", userData);
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

  async refreshToken() {
    try {
      const response = await rawAPI.post("/auth/refresh");
      return response.data.accessToken;
    } catch (error) {
      console.error("REFRESH TOKEN ERROR:", error);
      throw error;
    }
  },

  logout: async () => {
    storageService.clearAuth();
    const response = await API.post("/auth/logout");
    return response.data;
  },
};
