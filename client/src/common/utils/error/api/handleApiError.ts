/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/handleApiError.ts
import { AxiosError } from "axios";
import { audioService, SoundType } from "@/services/audioService";
import { toast } from "react-toastify";
import { UnauthorizedError } from "@/shared/types/enums/error-message.enum";
import { handleRefreshToken } from "./handleRefreshToken";
import handleUnauthorizedError from "../api/handleUnauthError";
import handleConflictError from "../api/handleConflictError";

export const handleApiError = () => {
  return (error: AxiosError) => {
    const status = error.response?.status;
    const code = (error.response?.data as any)?.code;
    const message = (error.response?.data as any)?.message || error.message;

    const originalRequest = error.config;

    if (status === 401) {
      if (code === UnauthorizedError.TOKEN_EXPIRED) {
        return handleRefreshToken(originalRequest);
      } else {
        handleUnauthorizedError(code);
      }
      return;
    }

    toast.error(`${status} - Code: ${code} - Message: ${message}`);
    console.error(`${status} - Code: ${code} - Message: ${message}`);

    if (status === 409) {
      handleConflictError(code);
      return;
    }

    audioService.stopAllSounds();
    audioService.playSound(SoundType.ERROR);

    return Promise.reject(error);
  };
};
