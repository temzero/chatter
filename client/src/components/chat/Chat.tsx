import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveChat } from "@/stores/chatStore";
import SidebarInfo from "./sidebarInfo/SidebarInfo";
import ChatHeader from "./ChatHeader";
import ChatBar from "./ChatBar";
import ChatBox from "./chatBox/ChatBox";
import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import { ChatMemberRole } from "@/types/enums/ChatMemberRole";

const ChatContent = React.memo(() => {
  const activeChat = useActiveChat();
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
            <ChatBar chatId={activeChat.id} myMemberId={activeChat.myMemberId} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

const ChatSidebar = React.memo(() => {
  const isChatInfoVisible = useSidebarInfoVisibility();

  return isChatInfoVisible ? (
    <div className="w-[var(--sidebar-width)]">
      <SidebarInfo />
    </div>
  ) : null;
});

const Chat: React.FC = () => {
  return (
    <section className="flex-1 flex h-full">
      <ChatContent />
      <ChatSidebar />
    </section>
  );
};

export default React.memo(Chat);
