import { motion, AnimatePresence } from "framer-motion";
import SidebarInfo from "./sidebarInfo/SidebarInfo";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import React from "react";

// Independent Sidebar component that doesn't depend on activeChat
export const ChatSidebar = React.memo(() => {
  console.log("ChatSidebar rendered");
  const isChatInfoVisible = useSidebarInfoStore(
    (state) => state.isSidebarInfoVisible
  );
  console.log('isChatInfoVisible', isChatInfoVisible)

  return (
    <AnimatePresence>
      {isChatInfoVisible && (
        <motion.div
          key={`sidebar-${isChatInfoVisible}`}
          initial={{ opacity: 0, x: 300, width: 0 }}
          animate={{ opacity: 1, x: 0, width: "var(--sidebar-width)" }}
          exit={{ opacity: 0, x: 300, width: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden" // Prevent content overflow during animation
        >
          <SidebarInfo />
        </motion.div>
      )}
    </AnimatePresence>

    // isChatInfoVisible && (
    //   <div className="w-[var(--sidebar-width)]">
    //     <SidebarInfo />
    //   </div>
    // )
  );
});
