import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { validatePassword } from "@/common/utils/validation/passwordValidation";
import { BackToLoginButton } from "@/components/ui/buttons/BackToLoginButton";
import { PasswordField } from "@/components/ui/form/PasswordField";

const ResetPassword = () => {
  const { t } = useTranslation();

  const formRef = useRef<HTMLFormElement>(null);
  // const { token } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  useEffect(() => {
    if (token) {
      // Use the token
      console.log("Reset token:", token);
    } else {
      console.error("No token provided");
      // Handle missing token
    }
  }, [token]);

  const loading = useAuthStore((state) => state.loading);
  const navigate = useNavigate();
  const resetPasswordWithToken = useAuthStore.getState().resetPasswordWithToken;
  const setMessage = useAuthStore.getState().setAuthMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate password strength
    const validation = validatePassword(t, password, confirmPassword);
    if (!validation.isValid) {
      return setMessage({
        type: "error",
        content: validation.message || t("auth.register.invalid_password"),
      });
    }

    if (!token) {
      return setMessage({
        type: "error",
        content: t("auth.reset_password.invalid_token"),
      });
    }

    await resetPasswordWithToken(token, password);
    setTimeout(() => navigate("/auth/login"), 2000);
  };

  return (
    <AuthenticationLayout>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full h-full flex flex-col justify-center gap-2 px-8 py-6"
      >
        <h2 className="text-4xl font-semibold mb-4 text-center">
          {t("auth.reset_password.title")}
        </h2>

        {/* <input
          type="password"
          name="password"
          placeholder={t("auth.reset_password.new_password")}
          required
          className="input-field"
          autoFocus
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder={t("auth.common.confirm_password")}
          required
          className="input-field"
        /> */}

        <PasswordField
          name="password"
          placeholder={t("auth.reset_password.new_password")}
          autoComplete="new-password"
          autoFocus
        />

        <PasswordField
          name="confirmPassword"
          placeholder={t("auth.common.confirm_password")}
          autoComplete="new-password"
        />

        <AlertMessage className="-mb-1" />

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="primary w-full py-1 mt-2"
        >
          {loading
            ? t("common.loading.processing")
            : t("auth.reset_password.title")}
        </motion.button>

        <BackToLoginButton label={t("auth.common.back_to_login")} />
      </form>
    </AuthenticationLayout>
  );
};

export default ResetPassword;
