import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { AlertMessage } from "@/components/ui/messages/AlertMessage";
import { AuthenticationLayout } from "@/layouts/PublicLayout";
import { motion } from "framer-motion";
import { publicLayoutAnimations } from "@/common/animations/publicLayoutAnimations";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const loading = useAuthStore((state) => state.loading);
  const login = useAuthStore.getState().login;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const identifier = formData.get("username") as string;
    const password = formData.get("password") as string;

    await login(identifier, password);
    navigate("/");
  };

  return (
    <AuthenticationLayout loading={loading}>
      <motion.div
        {...publicLayoutAnimations.container}
        className="flex items-center rounded-lg custom-border backdrop-blur-md bg-[var(--card-bg-color)] overflow-hidden"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col justify-center w-[400px] gap-2 p-8"
        >
          <h2 className="text-4xl font-semibold mb-4">
            {t("common.actions.login")}
          </h2>

          <input
            id="username"
            name="username"
            type="text"
            placeholder={t("auth.login.username_placeholder")}
            required
            className="input"
            autoComplete="username"
            autoFocus
          />

          <input
            id="password"
            type="password"
            name="password"
            placeholder={t("account.password")}
            required
            className="input"
            autoComplete="current-password"
          />

          <AlertMessage className="-mb-1" />

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="primary w-full py-1 mt-2"
          >
            {loading
              ? t("common.loading.logging_in")
              : t("common.actions.login")}
          </motion.button>

          <div className="flex items-center justify-between gap-4 mt-2">
            <Link
              to="/auth/register"
              className="opacity-40 hover:opacity-100 hover:text-green-400"
            >
              {t("common.actions.register")}
            </Link>
            <Link
              to="/auth/forgot-password"
              className="opacity-40 hover:opacity-100 hover:text-green-400"
            >
              {t("auth.login.forgot_password")}
            </Link>
          </div>
        </form>
        {/* 
        <motion.div
          className="h-full p-6 flex flex-1 flex-col gap-3 justify-end custom-border-l cursor-pointer select-none"
          onClick={toggleQrCode}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h1 className="text-xl font-semibold text-center">Scan to login</h1>
          {showQrCode ? (
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-[200px] rounded"
              src={qrCode}
              alt="Chatter Logo"
            />
          ) : (
            <QRCode className="w-[200px]" />
          )}
        </motion.div> */}
      </motion.div>
    </AuthenticationLayout>
  );
};

export default Login;
