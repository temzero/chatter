import { useChatStore } from "@/stores/chatStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

const ChatHeader: React.FC = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const toggleSidebarInfo = useSidebarInfoStore(
    (state) => state.toggleSidebarInfo
  );

  return (
    <header
      className="w-full cursor-pointer hover:shadow-2xl flex items-center justify-between min-h-[var(--header-height)] max-h-[var(--header-height)] px-4 shadow border-b border-[var(--border-color)] backdrop-blur-[199px] z-40"
      onClick={toggleSidebarInfo}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChat?.id || "no-chat"}
          className="flex gap-3 items-center cursor-pointer"
          initial={{ opacity: 0.2, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 0.9 }}
          transition={{
            type: "tween",
            duration: 0.1,
            ease: "easeInOut",
          }}
        >
          <ChatAvatar chat={activeChat} type="header" />

          <h1 className="text-xl font-medium">
            {activeChat?.name || "Select a chat"}
          </h1>
        </motion.div>
      </AnimatePresence>

      {activeChat && (
        <div className="flex gap-2">
          <a className="flex items-center cursor-pointer rounded-full opacity-60 hover:opacity-100 p-1">
            {activeChat.type === "private" && (
              <i className="material-symbols-outlined text-3xl">
                phone_enabled
              </i>
            )}
            {activeChat.type === "group" && (
              <i className="material-symbols-outlined text-3xl">videocam</i>
            )}
            {activeChat.type === "channel" && (
              <i className="material-symbols-outlined text-3xl">connected_tv</i>
            )}
          </a>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
