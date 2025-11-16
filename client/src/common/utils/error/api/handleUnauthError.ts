import { UnauthorizedError } from "@/shared/types/enums/error-message.enum";
import { useAuthStore } from "@/stores/authStore";
import { error } from "console";
import i18next from "i18next";
import { toast } from "react-toastify";

const handleUnauthorizedError = async (code: string) => {
  const t = i18next.t;

  const message = t(`error_message.401.${code}`) || "Unauthorized access.";

  const redirectToLogin = () => {
    useAuthStore.getState().logout();
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

export default handleUnauthorizedError;
