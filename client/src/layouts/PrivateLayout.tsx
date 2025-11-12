// PrivateLayout.tsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "@/components/sidebar/Sidebar";
import ChatBox from "@/components/chat/ChatBox";
import SidebarInfo from "@/components/chat/sidebarInfo/SidebarInfo";

import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import { useIsMobile } from "@/stores/deviceStore";
import { useIsMobileSound } from "@/common/hooks/useIsMobileSound";
import { useActiveChatId } from "@/stores/chatStore";
import logger from "@/common/utils/logger";

// Memoize static components to prevent unnecessary rerenders
const MemoSidebar = React.memo(Sidebar);
const MemoSidebarInfo = React.memo(SidebarInfo);

const PrivateLayout: React.FC = () => {
  logger.log({ prefix: "MOUNTED" }, "PrivateLayout");

  const isMobile = useIsMobile();
  const activeChatId = useActiveChatId();
  const isSidebarInfoVisible = useSidebarInfoVisibility();

  useIsMobileSound(isMobile);

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="w-full h-full flex justify-between">
        <MemoSidebar />
        {activeChatId && (
          <>
            <ChatBox />
            {isSidebarInfoVisible && <MemoSidebarInfo />}
          </>
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
          animate={{ x: activeChatId ? "-100%" : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-0 left-0 h-full w-full"
          style={{ zIndex: 10 }}
        >
          <MemoSidebar />
        </motion.div>
      </AnimatePresence>

      {activeChatId && (
        <>
          <ChatBox />

          <AnimatePresence>
            {isSidebarInfoVisible && (
              <motion.div
                key="sidebarInfo"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute top-0 right-0 h-full w-full"
                style={{ zIndex: 10 }}
              >
                <MemoSidebarInfo />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default PrivateLayout;
