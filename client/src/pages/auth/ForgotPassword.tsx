import { useRef } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { publicLayoutAnimations } from "@/common/animations/publicLayoutAnimations";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  
  const loading = useAuthStore((state) => state.loading);
  const formRef = useRef<HTMLFormElement>(null);
  const sendPasswordResetEmail = useAuthStore(
    (state) => state.sendPasswordResetEmail
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const email = formData.get("email") as string;

    await sendPasswordResetEmail(email);
  };

  return (
    <AuthenticationLayout>
      <motion.div
        {...publicLayoutAnimations.container}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-(--card-bg-color)"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold text-center mb-6">
            {t("auth.forgot_password.title")}
          </h2>

          <input
            type="email"
            name="email"
            placeholder={t("account.email")}
            required
            className="input backdrop-blur-lg"
            autoFocus
          />

          <AlertMessage className="-mb-1" />

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading
              ? t("common.loading.sending")
              : t("auth.forgot_password.button")}
          </motion.button>

          <div className="flex items-center gap-4 mt-2">
            <Link
              to="/auth/login"
              className="opacity-40 hover:opacity-100 hover:text-green-400"
            >
              {t("auth.common.back_to_login")}
            </Link>
          </div>
        </form>
      </motion.div>
    </AuthenticationLayout>
  );
};

export default ForgotPassword;
