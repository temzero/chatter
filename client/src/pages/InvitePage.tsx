import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleError } from "@/common/utils/error/handleError";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { chatService } from "@/services/http/chatService";
import { RingLoader } from "react-spinners";
import { useTranslation } from "react-i18next";

enum InviteStatus {
  LOADING = "loading",
  SUCCESS = "success",
  FAILED = "failed",
}

function InvitePage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<InviteStatus>(InviteStatus.LOADING);
  const [message, setMessage] = useState(t("invite_page.joining"));

  // Status configuration based on status type
  const statusConfig = {
    [InviteStatus.LOADING]: {
      color: null,
      border: "border-(--border-color)",
      icon: null,
    },
    [InviteStatus.SUCCESS]: {
      color: "text-green-500",
      border: "border-green-500/40",
      icon: "check_circle",
    },
    [InviteStatus.FAILED]: {
      color: "text-red-500",
      border: "border-red-500/40",
      icon: "error",
    },
  };

  const currentStatus = statusConfig[status];

  useEffect(() => {
    const joinChat = async () => {
      if (!token) {
        setMessage(t("invite_page.invalid_token"));
        setStatus(InviteStatus.FAILED);
        return;
      }

      try {
        const { chatId, message } = await chatService.joinChatWithInvite(token);
        setMessage(message || t("invite_page.joined_success"));
        setStatus(InviteStatus.SUCCESS);

        setTimeout(() => {
          navigate(`/${chatId}`);
          window.location.reload();
        }, 2000);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setMessage(t("invite_page.not_found"));
        } else if (error?.response?.status === 403) {
          setMessage(t("invite_page.access_denied"));
        } else {
          setMessage(t("invite_page.failed"));
        }

        setStatus(InviteStatus.FAILED);
        handleError(error, "Failed to join chat");
      }
    };

    joinChat();
  }, [navigate, token, t]);

  return (
    <AuthenticationLayout>
      <div className="relative w-full h-full p-6">
        <div
          className={`min-h-60 flex flex-col gap-8 items-center justify-center rounded border-2 ${currentStatus.border}`}
        >
          {currentStatus.icon && (
            <span
              className={`material-symbols-outlined text-7xl! ${currentStatus.color}`}
            >
              {currentStatus.icon}
            </span>
          )}
          {/* {status === InviteStatus.LOADING && (
            <RingLoader color="var(--primary-color)" size={100} />
          )} */}
          {status === InviteStatus.LOADING && (
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <RingLoader color="var(--primary-color)" size={160} />
            </div>
          )}

          <h1 className={`text-2xl font-semibold ${currentStatus.color}`}>
            {message}
          </h1>
        </div>
      </div>
    </AuthenticationLayout>
  );
}

export default InvitePage;
