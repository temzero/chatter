// src/services/api/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { localStorageService } from "../storage/localStorageService";
import { handleError } from "@/common/utils/handleError";
import { useAuthStore } from "@/stores/authStore";

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

    if (error.response?.status === 401) {
      console.log("Authentication failed, logging out...");
      useAuthStore.getState().logout();
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    } else {
      handleError(error, "An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

export default API;
