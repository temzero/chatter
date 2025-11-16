/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/handleApiError.ts
import { AxiosError } from "axios";
import { audioService, SoundType } from "@/services/audio.service";
import handleUnauthorizedError from "../api/handleUnauthError";
import handleConflictError from "../api/handleConflictError";
import { toast } from "react-toastify";

export const handleApiError = () => {
  return (error: AxiosError) => {
    const status = error.response?.status;
    const code = (error.response?.data as any)?.code;
    const message = (error.response?.data as any)?.message || error.message;

    toast.error(`${status} - Code: ${code} - Message: ${message}`);
    console.error(`${status} - Code: ${code} - Message: ${message}`);

    if (status === 401) {
      handleUnauthorizedError(code);
      return;
    }

    if (status === 409) {
      handleConflictError(code);
      return;
    }

    audioService.stopAllSounds();
    audioService.playSound(SoundType.ERROR);

    return Promise.reject(error);
  };
};

