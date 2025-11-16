/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/handleApiError.ts
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
import { audioService, SoundType } from "@/services/audio.service";
import { UnauthorizedError } from "@/shared/types/enums/error-message.enum";
import { toast } from "react-toastify";
import i18next from "i18next";
import { error } from "console";

export const handleApiError = () => {
  return (error: AxiosError) => {
    const status = error.response?.status;
    const code = (error.response?.data as any)?.code;
    const message = (error.response?.data as any)?.message || error.message;

    const requestUrl = error.config?.url || "";
    const currentPath = window.location.pathname;

    toast.error(`${status} - Code: ${code} - Message: ${message}`);
    console.error(`${status} - Code: ${code} - Message: ${message}`);

    if (status === 401) {
      handleUnauthorizedError(code, requestUrl, currentPath);
      return;
    }

    audioService.stopAllSounds();
    audioService.playSound(SoundType.ERROR);

    return Promise.reject(error);
  };
};

const handleUnauthorizedError = async (
  code: string,
  currentPath: string,
  requestUrl: string
) => {
  const t = i18next.t;
  const isAuthRoute = requestUrl.includes("/auth/");
  const isOnAuthPage = currentPath.includes("/auth/");

  const message = t(`error_message.401.${code}`) || "Unauthorized access.";

  const redirectToLogin = () => {
    console.info("Redirecting to login page...");
    useAuthStore.getState().logout();
    if (!isAuthRoute && !isOnAuthPage) window.location.href = "/auth/login";
  };

  if (code === UnauthorizedError.UNAUTHORIZED) {
    toast.error(message);
    console.error(message);
    return;
  }

  if (code === UnauthorizedError.TOKEN_EXPIRED) {
    toast.info(message);
    console.info(message);
    // redirectToLogin();

    return;
  }

  // if (code === UnauthorizedError.TOKEN_EXPIRED) {
  //   toast.info(message);
  //   console.info(message);

  //   try {
  //     // 1. Refresh the access token
  //     const newAccessToken = await useAuthStore.getState().refreshAccessToken();

  //     // 2. Update the original request's Authorization header
  //     if (error.config && newAccessToken) {
  //       error.config.headers = {
  //         ...error.config.headers,
  //         Authorization: `Bearer ${newAccessToken}`,
  //       };

  //       // 3. Retry the original request
  //       return API.request(error.config);
  //     }
  //   } catch (refreshError) {
  //     console.error("[AUTH] Refresh token failed", refreshError);
  //     // If refresh fails, logout handled inside refreshAccessToken
  //   }

  //   return;
  // }

  if (code === UnauthorizedError.REFRESH_TOKEN_EXPIRED) {
    toast.error(message);
    console.error(message);
    redirectToLogin();
    return;
  }

  if (code === UnauthorizedError.INVALID_TOKEN) {
    toast.error(message);
    console.error(message);
    redirectToLogin();
    return;
  }

  if (code === UnauthorizedError.INVALID_REFRESH_TOKEN) {
    toast.error(message);
    console.error(message);
    redirectToLogin();
    return;
  }

  if (code === UnauthorizedError.INVALID_CREDENTIALS) {
    useAuthStore.getState().setMessage("error", message);
    toast.error(message);
    console.error(message);
    return;
  }

  if (code === UnauthorizedError.SESSION_EXPIRED) {
    toast.error(message);
    console.error(message);
    redirectToLogin();
    return;
  }

  if (code === UnauthorizedError.ACCESS_DENIED) {
    toast.error(message);
    console.error(message);
    return;
  }

  // default fallback
  console.warn("Unhandled unauthorized error:", code, message);
};
