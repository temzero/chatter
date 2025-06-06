// src/services/api/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { localStorageService } from "../storage/localStorageService";
import { authService } from "../authService";

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
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    console.error("API Error:", error.response?.data);
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    // Handle 401 responses to refresh token via cookie
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If refresh is in progress, queue the request until token refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token?: unknown) => {
              if (!originalRequest.headers)
                originalRequest.headers = new axios.AxiosHeaders();
              originalRequest.headers.Authorization = `Bearer ${
                token as string
              }`;
              resolve(API(originalRequest));
            },
            reject: (err) => {
              console.error("Error in failedQueue:", err);
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;

      try {
        // toast.error("Session expired. Please log in again.");
        const newAccessToken = await authService.refreshToken();

        localStorageService.setAccessToken(newAccessToken);

        if (!originalRequest.headers)
          originalRequest.headers = new axios.AxiosHeaders();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
