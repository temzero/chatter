import { UnauthorizedError } from "@/shared/types/enums/error-message.enum";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "react-toastify";
import i18next from "i18next";

const handleUnauthorizedError = async (code: string) => {
  const t = i18next.t;

  const message = t(`error_message.401.${code}`) || "Unauthorized access.";

  if (code === UnauthorizedError.UNAUTHORIZED) {
    toast.error("UNAUTHORIZED");
    console.error("UNAUTHORIZED", message);
    return;
  }

  // if (code === UnauthorizedError.TOKEN_EXPIRED) {
  //   console.error(message);
  //   return;
  // }

  // if (code === UnauthorizedError.INVALID_TOKEN) {
  //   toast.error(message);
  //   console.error(message);
  //   return;
  // }

  // if (code === UnauthorizedError.REFRESH_TOKEN_EXPIRED) {
  //   console.error(message);
  //   useAuthStore.getState().logout();
  //   return;
  // }

  // if (code === UnauthorizedError.INVALID_REFRESH_TOKEN) {
  //   console.error(message);
  //   useAuthStore.getState().logout();
  //   return;
  // }

  if (code === UnauthorizedError.INVALID_CREDENTIALS) {
    useAuthStore.getState().setAuthMessage({
      type: "error",
      content: message,
    });
    // toast.error(message);
    // console.error(message);
    return;
  }

  // default fallback
  console.warn("Unhandled unauthorized error:", code, message);
};

export default handleUnauthorizedError;
