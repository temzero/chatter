import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleError } from "@/utils/handleError";
import { AuthenticationLayout } from "@/pages/PublicLayout";
import { chatService } from "@/services/chat/chatService";
import { BarLoader } from "react-spinners";

function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Joining...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const joinChat = async () => {
      if (!token) {
        setStatus("Invalid invite token");
        setIsLoading(false);
        setIsSuccess(false);
        return;
      }

      try {
        const { chatId, message } = await chatService.joinChatWithInvite(token);
        setStatus(message || "Joined successfully! Redirecting...");
        setIsSuccess(true);
        setTimeout(() => navigate(`/${chatId}`), 2000);
      } catch (error: unknown) {
        setStatus("Failed to join chat");
        setIsSuccess(false);
        handleError(error, "Failed to join chat");
      } finally {
        setIsLoading(false);
      }
    };

    joinChat();
  }, [navigate, token]);

  return (
    <AuthenticationLayout loading={isLoading}>
      <div className="flex flex-col items-center gap-4">
        {isSuccess !== null && (
          <span
            className={`material-symbols-outlined text-4xl ${
              isSuccess ? "text-green-500" : "text-red-500"
            }`}
          >
            {isSuccess ? "check_circle" : "error"}
          </span>
        )}
        <h1
          className={`text-xl ${
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
