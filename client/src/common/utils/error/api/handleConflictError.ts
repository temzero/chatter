import { toast } from "react-toastify";
import i18next from "i18next";
import { ConflictError } from "@/shared/types/enums/error-message.enum";
import { useAuthStore } from "@/stores/authStore";

const handleConflictError = (code: string) => {
  const t = i18next.t;
  const message =
    t(`error_message.409.${code}`) || "Conflict occurred. Please try again.";

  useAuthStore.getState().setAuthMessage({
    type: "error",
    content: message,
  });

  switch (code) {
    case ConflictError.EMAIL_ALREADY_EXISTS:
      toast.error(message);
      console.error(message);
      break;

    case ConflictError.USERNAME_TAKEN:
      toast.error(message);
      console.error(message);
      break;

    case ConflictError.ALREADY_FRIENDS:
      toast.info(message);
      console.info(message);
      break;

    case ConflictError.ALREADY_SENT_FRIEND_REQUEST:
      toast.info(message);
      console.info(message);
      break;

    case ConflictError.ALREADY_RECEIVED_FRIEND_REQUEST:
      toast.info(message);
      console.info(message);
      break;

    case ConflictError.MESSAGE_ALREADY_PINNED:
      toast.info(message);
      console.info(message);
      break;

    case ConflictError.CONFLICT:
    default:
      toast.error(message);
      console.error("Unhandled conflict error:", code, message);
      break;
  }
};

export default handleConflictError;
