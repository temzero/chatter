import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";
import ChatInfo from "./sidebarInfo/SidebarInfo";
import ChatHeader from "./ChatHeader";
import ChatBar from "./ChatBar";
import ChatBox from "./ChatBox";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

const Chat: React.FC = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const isChatInfoVisible = useSidebarInfoStore(
    (state) => state.isSidebarInfoVisible
  );

  return (
    <section className="flex-1 flex h-full">
      <section className="relative flex-1 flex flex-col justify-between h-full overflow-hidden">
        <ChatHeader />
        <ChatBox />
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
              <ChatBar />
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

export default Chat;
