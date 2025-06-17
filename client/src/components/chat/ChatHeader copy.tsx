import { useActiveChat } from "@/stores/chatStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import getChatName from "@/utils/getChatName";
import { FriendshipStatus } from "@/types/friendship";
import { ChatType } from "@/types/enums/ChatType";
import { OnlineDot } from "../ui/OnlineDot";
import { useChatOnlineStatus } from "@/hooks/useChatOnlineStatus";
import React from "react";

const ChatHeader: React.FC = () => {
  console.log('ChatHeader mounted');
  const activeChat = useActiveChat();

  const toggleSidebarInfo = useSidebarInfoStore(
    (state) => state.toggleSidebarInfo
  );
  const isOnline = useChatOnlineStatus(activeChat?.id);

  if (!activeChat) return null;

  const isChannel = activeChat.type === ChatType.CHANNEL;
  const isDirect = activeChat.type === ChatType.DIRECT;
  const isGroup = activeChat.type === ChatType.GROUP;

  return (
    <header
      className="absolute top-0 left-0 w-full cursor-pointer hover:shadow-2xl flex items-center justify-between min-h-[var(--header-height)] max-h-[var(--header-height)] px-3 backdrop-blur-xl shadow z-40"
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
          <h1 className="text-xl font-medium">{getChatName(activeChat)}</h1>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-1">
        <div className="flex items-center cursor-pointer rounded-full opacity-60 hover:opacity-100 p-1">
          {isDirect &&
            activeChat.chatPartner?.friendshipStatus ===
              FriendshipStatus.ACCEPTED && (
              <i className="material-symbols-outlined text-3xl">
                phone_enabled
              </i>
            )}
          {isGroup && (
            <i className="material-symbols-outlined text-3xl">videocam</i>
          )}
          {isChannel && (
            <i className="material-symbols-outlined text-3xl">connected_tv</i>
          )}
        </div>

        <OnlineDot isOnline={isOnline} />
      </div>
    </header>
  );
};

export default React.memo(ChatHeader);
