import { motion, AnimatePresence } from "framer-motion";
import { useActiveChat } from "@/stores/chatStore";
import SidebarInfo from "./sidebarInfo/SidebarInfo";
import ChatHeader from "./ChatHeader";
import ChatBar from "./ChatBar";
import ChatBox from "./chatBox/ChatBox";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import React from "react";
import { ChatResponse } from "@/types/responses/chat.response";

// Memoized ChatContent component to prevent re-renders when props don't change
const ChatContent = React.memo(({ chat }: { chat: ChatResponse }) => {
  console.log("ChatContent rendered for chat:", chat.id);

  return (
    <section className="relative flex-1 flex flex-col justify-between h-full overflow-hidden">
      <ChatHeader chat={chat} />
      <ChatBox chat={chat} />
      <AnimatePresence>
        {!(chat.type === "channel" && chat.myRole !== "owner") && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChatBar chatId={chat.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

// Independent Sidebar component that doesn't depend on activeChat
const ChatSidebar = React.memo(() => {
  console.log("ChatSidebar rendered");
  const isChatInfoVisible = useSidebarInfoStore(
    (state) => state.isSidebarInfoVisible
  );

  return (
    <AnimatePresence>
      {isChatInfoVisible && (
        <motion.div
          key="chat-sidebar" // Static key since sidebar content is the same
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
  );
});

// Main Chat component
const Chat: React.FC = () => {
  console.log("Chat component rendered");
  const activeChat = useActiveChat();

  if (!activeChat) return null;

  return (
    <section className="flex-1 flex h-full">
      {/* Chat content - will re-render when activeChat changes */}
      <ChatContent chat={activeChat} />

      {/* Sidebar - independent of activeChat changes */}
      <ChatSidebar />
    </section>
  );
};

// Performance optimization
export default React.memo(Chat);
