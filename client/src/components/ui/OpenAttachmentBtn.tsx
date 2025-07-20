import React from "react";
import { motion } from "framer-motion";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

const OpenAttachmentBtn: React.FC = () => {
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

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
        bottom: -1,
        opacity: 1,
        transition: {
          type: "tween", // For faster, linear movement
          duration: 0.15, // Much faster than default (0.3s)
          ease: "easeOut", // Quick acceleration, smooth stop
        },
      }}
      className="absolute -bottom-6 left-0 flex flex-col custom-border rounded-t-xl overflow-hidden w-full opacity-60"
    >
      <div
        className="flex flex-col p-2 pb-6 items-center justify-between w-full cursor-pointer hover:bg-[var(--hover-color)]"
        onClick={() => setSidebarInfo("media")}
      >
        <span className="material-symbols-outlined">keyboard_control_key</span>
        <div className="flex gap-2">
          <span className="flex flex-col justify-center items-center cursor-pointer">
            <i className="material-symbols-outlined">attach_file</i>
          </span>
          <h1>Media & Files</h1>
        </div>
      </div>
    </motion.div>
  );
};

export default OpenAttachmentBtn;
