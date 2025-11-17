// src/hooks/handleRefreshToken.ts
import API from "@/services/api/api";
import { useAuthStore } from "@/stores/authStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleRefreshToken = async (originalRequest: any) => {
  if (!originalRequest) return Promise.reject(new Error("No request to retry"));

  // Prevent infinite retry loops
  if (originalRequest._retry || originalRequest._isRefreshTokenRequest) {
    return Promise.reject(
      new Error("Already retried or refresh token request")
    );
  }

  originalRequest._retry = true;

  try {
    const newAccessToken = await useAuthStore.getState().refreshAccessToken();

    originalRequest.headers = {
      ...originalRequest.headers,
      Authorization: `Bearer ${newAccessToken}`,
    };

    return API(originalRequest);
  } catch (error) {
    // If refresh token fails, it should logout and not retry
    useAuthStore.getState().logout();
    return Promise.reject(error);
  }
};
