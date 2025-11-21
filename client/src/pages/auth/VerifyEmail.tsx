import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { publicLayoutAnimations } from "@/common/animations/publicLayoutAnimations";
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
      <motion.div
        {...publicLayoutAnimations.container}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)]"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
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
            {loading
              ? t("common.loading.verifying")
              : t("common.actions.verify")}
          </motion.button>
        </form>
      </motion.div>
    </AuthenticationLayout>
  );
};

export default VerifyEmail;
