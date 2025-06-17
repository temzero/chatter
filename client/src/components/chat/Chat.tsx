import { motion, AnimatePresence } from "framer-motion";
import { useActiveChat } from "@/stores/chatStore";
import ChatInfo from "./sidebarInfo/SidebarInfo";
import ChatHeader from "./ChatHeader";
import ChatBar from "./ChatBar";
import ChatBox from "./ChatBox";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import React from "react";

const Chat: React.FC = () => {
  console.log("Chat PARENT mounted");
  const activeChat = useActiveChat();
  // console.log("ACTIVE CHAT ID: ", activeChat?.id);

  const isChatInfoVisible = useSidebarInfoStore(
    (state) => state.isSidebarInfoVisible
  );

  if (!activeChat) return null;

  return (
    <section className="flex-1 flex h-full">
      <section className="relative flex-1 flex flex-col justify-between h-full overflow-hidden">
        <ChatHeader chat={activeChat} />
        <ChatBox chat={activeChat} />
        <AnimatePresence>
          {!(
            activeChat?.type === "channel" && activeChat.myRole !== "owner"
          ) && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatBar chatId={activeChat?.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ChatInfo sidebar animation */}
      <AnimatePresence>
        {isChatInfoVisible && (
          <motion.div
            initial={{ opacity: 0, x: 300, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "var(--sidebar-width)" }}
            exit={{ opacity: 0, x: 300, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChatInfo />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default React.memo(Chat);
