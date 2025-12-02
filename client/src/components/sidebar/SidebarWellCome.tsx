// src/components/ui/Welcome.tsx
import React, { useEffect } from "react";
import clsx from "clsx";
import { Logo } from "@/components/ui/icons/Logo";
import {
  getSetSidebar,
  useIsCompactSidebar,
  useSidebarStore,
} from "@/stores/sidebarStore";
import { SidebarMode } from "@/common/enums/sidebarMode";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "@/common/constants/name";

const SidebarWellCome: React.FC = () => {
  const { t } = useTranslation();

  const isCompact = useIsCompactSidebar();
  const setSidebar = getSetSidebar();

  useEffect(() => {
    useSidebarStore.setState({ isCompact: false });
  }, []);

  return (
    <aside
      className={`h-full w-full flex flex-col transition-all duration-300 ease-in-out select-none`}
    >
      <div
        className={clsx(
          "flex flex-col justify-between p-6 gap-4 items-center h-full w-full text-center transition-all"
        )}
      >
        {!isCompact && <div />}
        <div className="flex flex-col items-center gap-4">
          <button
            className="hover:opacity-60"
            onClick={() => setSidebar(SidebarMode.MORE)}
          >
            <Logo className="w-20 h-20" />
          </button>
          {isCompact || (
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <h1 className="text-2xl font-semibold">
                {t("sidebar_well_come.well_come")} {APP_NAME}!
              </h1>
              <motion.p className="opacity-60 italic">
                {t("sidebar_well_come.description")}
              </motion.p>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            className="mt-8 w-12 h-12 rounded-full flex items-center justify-center select-none text-white bg-[--primary-green] hover:border-2 border-white/50 shadow-xl"
            onClick={() => setSidebar(SidebarMode.NEW_CHAT)}
          >
            <i className="material-symbols-outlined text-4xl!">add</i>
          </button>

          {isCompact || (
            <motion.p
              animate={{
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="truncate"
            >
              {t("sidebar_well_come.start_conversation")}
            </motion.p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarWellCome;
