import axios from "axios";
import { MyProfileProps } from "@/data/types";

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  async login(usernameOrEmail: string, password: string) {
    const { data } = await axios.post(`${API_URL}/auth/login`, {
      usernameOrEmail,
      password,
    });
    return data;
  },

  async register(userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) {
    const { data } = await axios.post(`${API_URL}/auth/register/`, userData);
    return data;
  },

  async sendPasswordResetEmail(email: string) {
    const { data } = await axios.post(
      `${API_URL}/auth/send-password-reset-email`,
      { email }
    );
    return data;
  },

  async resetPasswordWithToken(token: string, newPassword: string) {
    const { data } = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
    return data;
  },

  async verifyEmailWithToken(token: string) {
    const { data } = await axios.get(
      `${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
    );
    return data;
  },
};

// Local storage helpers (could also be moved to a separate storage service)
export const storageService = {
  getUser(): MyProfileProps | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setUser(user: MyProfileProps) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
  },

  clear() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },
};
