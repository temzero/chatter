import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import getChatName from "@/utils/getChatName";
import { FriendshipStatus } from "@/types/friendship";
import { ChatType } from "@/types/enums/ChatType";
import { OnlineDot } from "../ui/OnlineDot";
// import { useChatOnlineStatus } from "@/hooks/useChatOnlineStatus";
import type { ChatResponse } from "@/types/chat";
import { useChatStatus } from "@/stores/presenceStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
// import { useChatStatus } from "@/stores/presenceStore";

interface ChatHeaderProps {
  chat: ChatResponse;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chat }) => {
  console.log("CHAT HEADER rendered");
  const toggleSidebarInfo = useSidebarInfoStore(
    (state) => state.toggleSidebarInfo
  );

  const chatListMembers = useChatMemberStore.getState().chatMembers[chat.id];
  console.log("chat Header Members", chat.type, chatListMembers);

  // const isOnline = useChatOnlineStatus(chat?.id);
  const isOnline = useChatStatus(chat?.id, chat.type);
  console.log("ChatHeader isOnline", isOnline);

  // Memoize derived values
  const isChannel = React.useMemo(
    () => chat.type === ChatType.CHANNEL,
    [chat.type]
  );
  const isDirect = React.useMemo(
    () => chat.type === ChatType.DIRECT,
    [chat.type]
  );
  const isGroup = React.useMemo(
    () => chat.type === ChatType.GROUP,
    [chat.type]
  );

  if (!chat) return null;

  return (
    <header
      className="absolute top-0 left-0 w-full cursor-pointer hover:shadow-2xl flex items-center justify-between min-h-[var(--header-height)] max-h-[var(--header-height)] px-3 backdrop-blur-xl shadow z-40"
      onClick={toggleSidebarInfo}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={chat.id}
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
          <ChatAvatar chat={chat} type="header" />
          <h1 className="text-xl font-medium">{getChatName(chat)}</h1>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-1">
        <div className="flex items-center cursor-pointer rounded-full opacity-60 hover:opacity-100 p-1">
          {isDirect &&
            "chatPartner" in chat &&
            chat.chatPartner?.friendshipStatus ===
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
