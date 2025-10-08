import React from "react";
import ChatBox from "@/components/chat/ChatBox";
import SidebarInfo from "@/components/chat/sidebarInfo/SidebarInfo";
import Sidebar from "@/components/sidebar/Sidebar";
import { useActiveChat } from "@/stores/chatStore";
import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import { AnimatePresence, motion } from "framer-motion";

const MobileView: React.FC = () => {
  const activeChat = useActiveChat();
  const isSidebarVisible = useSidebarInfoVisibility();

  return (
    <div className="w-full h-full flex relative">
      <AnimatePresence>
        <motion.div
          key="sidebar"
          initial={{ x: 0 }} // start visible
          animate={{ x: activeChat ? "-100%" : 0 }} // move left when activeChat, else x=0
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

export default MobileView;
