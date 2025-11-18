// src/hooks/handleRefreshTokenError.ts
import { UnauthorizedError } from "@/shared/types/enums/error-message.enum";
import { useAuthStore } from "@/stores/authStore";
import i18next from "i18next";
import { toast } from "react-toastify";

export interface RefreshTokenError {
  response?: {
    data?: {
      code?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export const handleRefreshTokenError = (error: RefreshTokenError): void => {
  const t = i18next.t;

  const code = error.response?.data?.code;

  console.log("[AUTH]", `Refresh token error: ${code}`);

  // Show appropriate toast message
  switch (code) {
    case UnauthorizedError.REFRESH_TOKEN_EXPIRED:
      toast.error(t("auth.token.session_expired"));
      break;
    case UnauthorizedError.INVALID_REFRESH_TOKEN:
      toast.error(t("auth.token.invalid_session"));
      break;
    default:
      toast.error(t("auth.failed"));
  }

  // useAuthStore.getState().logout();
  // Logout after delay
  setTimeout(() => {
    console.log("[AUTH]", "Logging out due to refresh token failure");
    useAuthStore.getState().logout();
  }, 3000);
};
