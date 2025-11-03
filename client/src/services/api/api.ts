// src/services/api/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { localStorageService } from "../storage/localStorageService";
import { useAuthStore } from "@/stores/authStore";
import { audioService, SoundType } from "../audio.service";

const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// REQUEST interceptor
// Add Authorization & device info headers
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorageService.getAccessToken();
    const deviceId = localStorageService.getDeviceId();
    const deviceName = localStorageService.getDeviceName();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers["x-device-id"] = deviceId;
    config.headers["x-device-name"] = deviceName;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// RESPONSE interceptor
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    console.error("API Error:", error.response?.data);

    audioService.stopAllSounds();
    audioService.playSound(SoundType.ERROR);

    const requestUrl = error.config?.url || "";
    const currentPath = window.location.pathname;
    const isAuthRoute = requestUrl.includes("/auth/");
    const isCurrentlyOnAuthPage = currentPath.includes("/auth/");

    if (error.response?.status === 401) {
      // Only redirect if:
      // 1. It's NOT an auth API call AND
      // 2. User is not already on auth page (prevents double redirect)
      if (!isAuthRoute && !isCurrentlyOnAuthPage) {
        console.warn("Access token invalid, redirecting to login...");
        useAuthStore.getState().logout();
        window.location.href = "/auth/login";
      }
      // For auth routes or when already on auth page, just reject
    }

    return Promise.reject(error);
  }
);

export default API;
