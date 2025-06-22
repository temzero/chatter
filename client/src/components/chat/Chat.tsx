import { motion, AnimatePresence } from "framer-motion";
import { useActiveChat } from "@/stores/chatStore";
import SidebarInfo from "./sidebarInfo/SidebarInfo";
import ChatHeader from "./ChatHeader";
import ChatBar from "./ChatBar";
import ChatBox from "./chatBox/ChatBox";
import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import React from "react";
import { ChatMemberRole } from "@/types/ChatMemberRole";

// Memoized ChatContent component to prevent re-renders when props don't change
const ChatContent = React.memo(() => {
  const activeChat = useActiveChat();
  // const activeChat = useChatStore.getState().activeChat
  if (!activeChat) return null;

  return (
    <section className="relative flex-1 flex flex-col justify-between h-full overflow-hidden">
      <ChatHeader chat={activeChat} />
      <ChatBox chat={activeChat} />
      <AnimatePresence>
        {!(
          activeChat.type === "channel" &&
          activeChat.myRole !== ChatMemberRole.OWNER
        ) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChatBar chatId={activeChat.id} memberId={activeChat.myMemberId} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

// Independent Sidebar component that doesn't depend on activeChat
const ChatSidebar = React.memo(() => {
  console.log("ChatSidebar rendered");
  const isChatInfoVisible = useSidebarInfoVisibility();

  return (
    // <AnimatePresence>
    //   {isChatInfoVisible && (
    //     <motion.div
    //       key={`sidebar-${isChatInfoVisible}`}
    //       initial={{ opacity: 0, x: 300, width: 0 }}
    //       animate={{ opacity: 1, x: 0, width: "var(--sidebar-width)" }}
    //       exit={{ opacity: 0, x: 300, width: 0 }}
    //       transition={{ duration: 0.2, ease: "easeInOut" }}
    //       className="overflow-hidden" // Prevent content overflow during animation
    //     >
    //       <SidebarInfo />
    //     </motion.div>
    //   )}
    // </AnimatePresence>

    isChatInfoVisible && (
      <div className="w-[var(--sidebar-width)]">
        <SidebarInfo />
      </div>
    )
  );
});

// Main Chat component
const Chat: React.FC = () => {
  return (
    <section className="flex-1 flex h-full">
      {/* Chat content - will re-render when activeChat changes */}
      <ChatContent />

      {/* Sidebar - independent of activeChat changes */}
      <ChatSidebar />
    </section>
  );
};

// Performance optimization
export default React.memo(Chat);
