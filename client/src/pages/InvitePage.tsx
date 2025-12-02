import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleError } from "@/common/utils/error/handleError";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { chatService } from "@/services/http/chatService";
import { BarLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
function InvitePage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState(t("invite_page.joining"));
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const joinChat = async () => {
      if (!token) {
        setStatus(t("invite_page.invalid_token"));
        setIsLoading(false);
        setIsSuccess(false);
        return;
      }

      try {
        const { chatId, message } = await chatService.joinChatWithInvite(token);
        setStatus(message || t("invite_page.joined_success"));
        setIsSuccess(true);

        setTimeout(() => {
          navigate(`/${chatId}`);
          window.location.reload();
        }, 2000);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setStatus(t("invite_page.not_found"));
        } else if (error?.response?.status === 403) {
          setStatus(t("invite_page.access_denied"));
        } else {
          setStatus(t("invite_page.failed"));
        }

        setIsSuccess(false);
        handleError(error, "Failed to join chat");
      } finally {
        setIsLoading(false);
      }
    };

    joinChat();
  }, [navigate, token, t]);

  return (
    <AuthenticationLayout loading={isLoading}>
      <div className="flex flex-col items-center gap-3">
        {isSuccess !== null && (
          <span
            className={`material-symbols-outlined text-6xl! ${
              isSuccess ? "text-green-500" : "text-red-500"
            }`}
          >
            {isSuccess ? "check_circle" : "error"}
          </span>
        )}
        <h1
          className={`text-xl font-semibold ${
            isSuccess
              ? "text-green-600"
              : isSuccess === false
              ? "text-red-600"
              : ""
          }`}
        >
          {status}
        </h1>
        {isLoading && <BarLoader color="#6f6f6f" width={250} />}
      </div>
    </AuthenticationLayout>
  );
}

export default InvitePage;
