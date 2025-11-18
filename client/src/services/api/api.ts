// src/services/api/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { localStorageService } from "../storage/localStorageService";
import { handleApiError } from "@/common/utils/error/api/handleApiError";
import { EnvConfig } from "@/common/config/env.config";

const API: AxiosInstance = axios.create({
  baseURL: EnvConfig.apiUrl,
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

// Response interceptor
API.interceptors.response.use(
  (res) => res,
  (error) => handleApiError()(error) // call your factory function here
);

export default API;
