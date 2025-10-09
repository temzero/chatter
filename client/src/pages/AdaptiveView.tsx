import React from "react";
import ChatBox from "@/components/chat/ChatBox";
import SidebarInfo from "@/components/chat/sidebarInfo/SidebarInfo";
import Sidebar from "@/components/sidebar/Sidebar";
import { useActiveChat } from "@/stores/chatStore";
import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobileSound } from "@/hooks/useIsMobileSound";

const AdaptiveView: React.FC = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const activeChat = useActiveChat();
  const isSidebarVisible = useSidebarInfoVisibility();
  const isSidebarCompact = useSidebarStore((state) => state.isCompact);

  useIsMobileSound(isMobile);

  // Desktop Layout
  if (!isMobile) {
    const sidebarClasses = isSidebarCompact
      ? "w-[var(--sidebar-width-small)]"
      : "w-[var(--sidebar-width)]";

    return (
      <div className="w-full h-full flex justify-between">
        <div id="sidebar" className={sidebarClasses}>
          <Sidebar />
        </div>
        <ChatBox />
        {isSidebarVisible && (
          <div id="sidebar-info" className="w-[var(--sidebar-width)]">
            <SidebarInfo />
          </div>
        )}
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className="w-full h-full flex relative">
      <AnimatePresence>
        <motion.div
          key="sidebar"
          initial={false}
          animate={{ x: activeChat ? "-100%" : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-0 left-0 h-full w-full"
          style={{ zIndex: 10 }}
        >
          <Sidebar />
        </motion.div>
      </AnimatePresence>

      <ChatBox />

      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            key="sidebarInfo"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 right-0 h-full w-full"
            style={{ zIndex: 10 }}
          >
            <SidebarInfo />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdaptiveView;
