import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const VerifyEmail = () => {
  const { t } = useTranslation();

  const { firstName, email, token } = useParams();

  const loading = useAuthStore((state) => state.loading);
  const verifyEmailWithToken = useAuthStore(
    (state) => state.verifyEmailWithToken
  );
  const setMessage = useAuthStore.getState().setAuthMessage;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      return setMessage({
        type: "error",
        content: t("auth.verify_email.invalid_token"),
      });
    }

    await verifyEmailWithToken(token);
    setTimeout(() => navigate("/auth/login"), 2000);
  };

  return (
    <AuthenticationLayout>
      <form
        onSubmit={handleSubmit}
        className="w-full h-full flex flex-col justify-center gap-2 px-8 py-6"
      >
        <h2 className="text-4xl font-semibold mb-4 text-center">
          {t("auth.verify_email.title")}
        </h2>

        <div className="opacity-80 py-2 flex flex-col items-center justify-center">
          <p>{t("auth.verify_email.greeting", { name: firstName })}</p>
          <p>{t("auth.verify_email.confirm_message")}</p>
          <div className="text-green-400 flex items-center gap-1 font-semibold mt-2">
            <span className="material-symbols-outlined">mail</span>
            {email}
          </div>
        </div>

        <AlertMessage className="-mb-1 text-center" />

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="primary w-full py-1 mt-2"
        >
          {loading ? t("common.loading.verifying") : t("common.actions.verify")}
        </motion.button>
      </form>
    </AuthenticationLayout>
  );
};

export default VerifyEmail;
