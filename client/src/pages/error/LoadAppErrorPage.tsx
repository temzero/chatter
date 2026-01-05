import * as React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "react-i18next";
import { LogoWithText } from "@/components/ui/icons/LogoWithText";

const LoadAppErrorPage: React.FC = () => {
  const { t } = useTranslation();

  function handleLogout() {
    useAuthStore.getState().logout();
  }

  return (
    <div className="relative flex flex-col p-6 items-center justify-between h-screen bg-red-500 text-white">
      <LogoWithText/>
      <motion.span
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex flex-col items-center justify-center gap-1"
      >
        <span className="material-symbols-outlined text-6xl! select-none">
          warning
        </span>
        <h1 className="text-lg font-medium">
          {t(
            "common.messages.load_app_error",
            "Failed to load app. Please refresh."
          )}
        </h1>
      </motion.span>
      <button
        className="px-3 py-1 rounded hover:bg-white hover:text-red-500"
        onClick={handleLogout}
      >
        {t("auth.common.back_to_login", "Back To Login")}
      </button>
    </div>
  );
};

export default LoadAppErrorPage;
