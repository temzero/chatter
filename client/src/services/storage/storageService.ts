import { MyProfileProps } from "@/data/types";

export const storageService = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  setToken(token: string): void {
    localStorage.setItem("token", token);
  },

  // User data management
  getUser(): MyProfileProps | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  setUser(user: MyProfileProps): void {
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear all auth-related data
  clearAuth(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // General storage methods
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  },

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clearAll(): void {
    localStorage.clear();
  },
};
