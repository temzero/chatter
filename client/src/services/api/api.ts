// src/services/api/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { storageService } from "../storage/storageService";

const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Auto-logout if 401 response
      storageService.clearAuth();
      window.location.href = "/login"; // Redirect to login
    }

    // You can add more specific error handling here
    return Promise.reject(error);
  }
);

export default API;
