import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { publicLayoutAnimations } from "@/common/animations/publicLayoutAnimations";
import { useTranslation } from "react-i18next";
import { validatePassword } from "@/common/utils/validation/passwordValidation";

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
    <AuthenticationLayout>
      <motion.div
        {...publicLayoutAnimations.container}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-(--card-bg-color) mt-20"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
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

          <input
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

export default Register;
