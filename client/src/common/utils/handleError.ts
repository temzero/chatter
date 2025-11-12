import { audioService, SoundType } from "@/services/audio.service";
import { toast } from "react-toastify";
import logger from "./logger";

export function handleError(error: unknown, defaultMessage: string): never {
  audioService.stopAllSounds();
  audioService.playSound(SoundType.ERROR);

  let message = defaultMessage;

  if (typeof error === "object" && error !== null) {
    const axiosError = error as {
      response?: { data?: { message?: string | string[]; error?: string } };
      message?: string;
    };

    const data = axiosError?.response?.data;

    if (Array.isArray(data?.message)) {
      message = data.message[0] || defaultMessage;
    } else if (typeof data?.message === "string") {
      message = data.message;
    } else if (typeof data?.error === "string") {
      message = data.error;
    } else if (typeof axiosError.message === "string") {
      message = axiosError.message;
    }
  }

  toast.error(message);
  logger.error(error);

  throw error; // ensures TypeScript knows this never returns
}
