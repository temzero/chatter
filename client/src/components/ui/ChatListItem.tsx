import React from "react";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import type { ChatResponse } from "@/types/chat";
import { ChatAvatar } from "./avatar/ChatAvatar";
import getChatName from "../../utils/getChatName";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { OnlineDot } from "./OnlineDot";
import SimpleTypingIndicator from "./typingIndicator/SimpleTypingIndicator";
import { AnimatePresence, motion } from "framer-motion";
// import SimpleTypingIndicator from "./typingIndicator/SimpleTypingIndicator";

interface ChatListItemProps {
  chat: ChatResponse;
  isCompact?: boolean;
  isOnline: boolean;
  currentUserId: string;
  typingUsers?: string[];
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isCompact = false,
  isOnline,
  currentUserId = "",
  typingUsers = [],
}) => {
  const activeChatId = useChatStore((state) => state.activeChat?.id);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const getDraftMessage = useMessageStore((state) => state.getDraftMessage);

  const handleChatSelect = () => {
    setActiveChat(chat);
  };

  const getUserItemClass = () => {
    const baseClasses =
      "relative flex items-center w-full h-24 gap-3 p-3 transition-all duration-300 ease-in-out cursor-pointer";
    const activeClasses =
      activeChatId === chat.id
        ? "bg-[var(--active-chat-color)]"
        : " hover:bg-[var(--hover-color)]";
    return `${baseClasses} ${activeClasses}`;
  };

  const draft = getDraftMessage(chat.id);
  const displayMessage = draft ? (
    <p className="text-[var(--primary-green)] flex items-center gap-1 overflow-hidden max-w-[196px]">
      <i className="material-symbols-outlined flex items-center justify-center text-[16px] h-3">
        edit
      </i>
      <span className="text-xs whitespace-nowrap text-ellipsis">{draft}</span>
    </p>
  ) : chat.lastMessage ? (
    <p className="flex items-center opacity-70 gap-1 text-xs max-w-[196px] whitespace-nowrap text-ellipsis overflow-hidden min-h-6">
      <strong>
        {chat.lastMessage.senderId === currentUserId
          ? "Me"
          : chat.lastMessage.senderName}
        :
      </strong>
      {chat.lastMessage.icon && (
        <i className="material-symbols-outlined text-sm">
          {chat.lastMessage.icon}
        </i>
      )}
      {chat.lastMessage.content}
    </p>
  ) : null;

  return (
    <>
      <div className={getUserItemClass()} onClick={handleChatSelect}>
        <OnlineDot
          isOnline={isOnline}
          className="absolute top-1/2 left-[3px] -translate-y-1/2"
        />
        <ChatAvatar chat={chat} type="sidebar" />

        {!isCompact && (
          <>
            <div className="flex flex-col justify-center gap-1">
              <h1 className="text-lg font-semibold whitespace-nowrap text-ellipsis">
                {getChatName(chat)}
              </h1>
              <AnimatePresence mode="wait" initial={false}>
                {typingUsers.length > 0 ? (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SimpleTypingIndicator
                      chatId={chat.id}
                      userIds={typingUsers}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {displayMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="absolute top-2 right-4 text-xs opacity-40">
              {getTimeAgo(chat.lastMessage?.createdAt ?? chat.updatedAt)}
            </p>
          </>
        )}
      </div>

      {!isCompact && <div className="w-[90%] mx-auto custom-border-b"></div>}
    </>
  );
};

export default ChatListItem;
