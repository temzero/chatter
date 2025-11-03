// src/components/ui/Welcome.tsx
import React from "react";
import { Logo } from "@/components/ui/icons/Logo";
import { getSetSidebar } from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "@/common/constants/name";

const SidebarWellCome: React.FC = () => {
  const { t } = useTranslation();
  const setSidebar = getSetSidebar();

  return (
    <aside
      className={`h-full flex flex-col transition-all duration-300 ease-in-out select-none`}
    >
      <div className="flex flex-col gap-2 items-center justify-center h-full w-full text-center px-4">
        <button
          className="hover:opacity-60"
          onClick={() => setSidebar(SidebarMode.MORE)}
        >
          <Logo className="w-20 h-20" />
        </button>
        <h1 className="text-2xl font-semibold mt-4">
          {t("sidebar_well_come.well_come")} {APP_NAME}!
        </h1>
        <p className="opacity-60">{t("sidebar_well_come.description")}</p>

        <button
          className="mt-8 w-12 h-12 rounded-full flex items-center justify-center select-none text-white bg-[--primary-green] hover:border-2 border-white/50"
          onClick={() => setSidebar(SidebarMode.NEW_CHAT)}
        >
          <i className="material-symbols-outlined text-4xl">add</i>
        </button>
        <motion.p
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {t("sidebar_well_come.start_conversation")}
        </motion.p>
      </div>
    </aside>
  );
};

export default SidebarWellCome;
