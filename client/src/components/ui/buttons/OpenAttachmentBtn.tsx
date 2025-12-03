import * as React from "react";
import { motion } from "framer-motion";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { useTranslation } from "react-i18next";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";

const OpenAttachmentBtn: React.FC = () => {
  const { t } = useTranslation();
  const setSidebarInfo = getSetSidebarInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 160,
        damping: 16,
        mass: 1,
      }}
      whileHover={{
        bottom: -4,
        opacity: 1,
        transition: {
          type: "tween", // For faster, linear movement
          duration: 0.15, // Much faster than default (0.3s)
          ease: "easeOut", // Quick acceleration, smooth stop
        },
      }}
      className="absolute -bottom-9 left-0 flex flex-col border-2 border-b-0 border-(--border-color) rounded-t-xl overflow-hidden w-full opacity-60 select-none"
    >
      <div
        className="flex flex-col p-1 pb-10 items-center justify-between w-full cursor-pointer shadow-xl hover:bg-linear-to-b from-(--hover-color) to-transparent"
        onClick={() => setSidebarInfo(SidebarInfoMode.MEDIA)}
      >
        <span className="material-symbols-outlined -mb-1">
          keyboard_control_key
        </span>
        <div className="flex gap-2">
          {/* <span className="flex flex-col justify-center items-center cursor-pointer">
            <i className="material-symbols-outlined">attach_file</i>
          </span> */}
          <h1>{t("sidebar_info.media_files.title")}</h1>
        </div>
      </div>
    </motion.div>
  );
};

export default OpenAttachmentBtn;
