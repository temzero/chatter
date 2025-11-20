// src/hooks/handleRefreshTokenError.ts
import { audioService, SoundType } from "@/services/audio.service";
import { useAuthStore } from "@/stores/authStore";
import i18next from "i18next";
import { toast } from "react-toastify";

export const handleRefreshTokenError = (): void => {
  const t = i18next.t;
  audioService.playSound(SoundType.LOGOUT);

  toast.warn(t("auth.token.session_expired"));

  // useAuthStore.getState().logout();
  // Logout after delay
  setTimeout(() => {
    useAuthStore.getState().logout();
  }, 3000);
};
