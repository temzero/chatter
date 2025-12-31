import { useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BackToLoginButton } from "@/components/ui/buttons/BackToLoginButton";

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
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full h-full flex flex-col justify-center gap-2 px-8 py-6"
      >
        <h2 className="text-4xl font-semibold text-center mb-6">
          {t("auth.forgot_password.title")}
        </h2>

        <input
          type="email"
          name="email"
          placeholder={t("account.email")}
          required
          className="input-field"
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

        <BackToLoginButton label={t("auth.common.back_to_login")} />
      </form>
    </AuthenticationLayout>
  );
};

export default ForgotPassword;
