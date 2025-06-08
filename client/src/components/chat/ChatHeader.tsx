import { useChatStore } from "@/stores/chatStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import getChatName from "@/utils/getChatName";
import { FriendshipStatus } from "@/types/friendship";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useGroupOnlineStatus } from "@/hooks/useGroupOnlineStatus";
import { ChatType } from "@/types/enums/ChatType";

const ChatHeader: React.FC = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const toggleSidebarInfo = useSidebarInfoStore(
    (state) => state.toggleSidebarInfo
  );

  const directUserId =
    activeChat?.type === ChatType.DIRECT
      ? activeChat.chatPartner?.userId
      : undefined;
  const isOnline = useOnlineStatus(directUserId);
  const isGroupOnline = useGroupOnlineStatus(activeChat?.id);

  if (!activeChat) return null;

  const isChannel = activeChat.type === ChatType.CHANNEL;
  const isDirect = activeChat.type === ChatType.DIRECT;
  const isGroup = activeChat.type === ChatType.GROUP;

  console.log("isGroupOnline", isGroupOnline);

  const showOnlineStatus = (isDirect && isOnline) || (isGroup && isGroupOnline);

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
          <div className="relative">
            <ChatAvatar chat={activeChat} type="header" />
            {!isChannel && showOnlineStatus && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--background-color)]"></div>
            )}
          </div>
          <h1 className="text-xl font-medium">{getChatName(activeChat)}</h1>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
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
      </div>
    </header>
  );
};

export default ChatHeader;
