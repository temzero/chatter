import { UnauthorizedError } from "@/shared/types/enums/error-message.enum";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-toastify";
import i18next from "i18next";

const handleUnauthorizedError = async (code: string) => {
  const t = i18next.t;

  const message = t(`error_message.401.${code}`) || "Unauthorized access.";

  const redirectToLogin = () => {
    console.log('redirectToLogin')
    // useAuthStore.getState().logout();
  };

  if (code === UnauthorizedError.UNAUTHORIZED) {
    toast.error(message);
    console.error(message);
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
