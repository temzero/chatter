import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { validatePassword } from "@/common/utils/validation/passwordValidation";
import { BackToLoginButton } from "@/components/ui/buttons/BackToLoginButton";
import { PasswordField } from "@/components/ui/form/PasswordField";

const Register = () => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const loading = useAuthStore((state) => state.loading);
  const register = useAuthStore.getState().register;
  const setMessage = useAuthStore.getState().setAuthMessage;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
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

    await register({
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      password,
    });

    navigate("/");
  };

  const capitalizeFirstLetter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.target;
    if (value.length === 1) {
      e.target.value = value.charAt(0).toUpperCase() + value.slice(1);
      e.target.setSelectionRange(selectionStart, selectionStart);
    }
  };

  return (
    <AuthenticationLayout childrenClassName="mt-20">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full h-full flex flex-col justify-center gap-2 px-8 py-6"
      >
        <h2 className="text-4xl font-semibold mb-4">
          {t("common.actions.register")}
        </h2>

        <input
          type="text"
          name="username"
          placeholder={t("account.username")}
          required
          className="input-field"
          autoComplete="username"
          autoFocus
        />

        <div className="flex gap-2">
          <input
            type="text"
            name="firstName"
            placeholder={t("account.first_name")}
            required
            className="input-field"
            ref={firstNameRef}
            onChange={capitalizeFirstLetter}
          />
          <input
            type="text"
            name="lastName"
            placeholder={t("account.last_name")}
            required
            className="input-field"
            ref={lastNameRef}
            onChange={capitalizeFirstLetter}
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder={t("account.email")}
          required
          className="input-field"
        />

        {/* <input
          type="password"
          name="password"
          placeholder={t("account.password")}
          required
          className="input-field"
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
          placeholder={t("account.password")}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
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
            ? t("auth.register.button_loading")
            : t("common.actions.register")}
        </motion.button>

        <BackToLoginButton label={t("auth.common.back_to_login")} />
      </form>
    </AuthenticationLayout>
  );
};

export default Register;
