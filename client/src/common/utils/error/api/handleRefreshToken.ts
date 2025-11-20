// src/hooks/handleRefreshToken.ts
import API from "@/services/api/api";
import { useAuthStore } from "@/stores/authStore";
import { handleRefreshTokenError } from "./handleRefreshTokenError";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleRefreshToken = async (originalRequest: any) => {
  console.log("[AUTH]", "Access Token Expired. Refreshing...");

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

    // Explicitly update headers for this request
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

    return API(originalRequest);
  } catch {
    handleRefreshTokenError();
    return;
  }
};
