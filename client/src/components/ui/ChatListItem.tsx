import React from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useTypingUsersByChatId } from "@/stores/typingStore";
import type { ChatResponse } from "@/types/responses/chat.response";
import { ChatAvatar } from "./avatar/ChatAvatar";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { OnlineDot } from "./OnlineDot";
import SimpleTypingIndicator from "./typingIndicator/SimpleTypingIndicator";
import { AnimatePresence, motion } from "framer-motion";
// import { useChatOnlineStatus } from "@/hooks/useChatOnlineStatus";
import { useChatStore, useIsActiveChat } from "@/stores/chatStore";
import { useChatStatus } from "@/stores/presenceStore";
import { ChatType } from "@/types/enums/ChatType";
import { useBlockStatus } from "@/hooks/useBlockStatus";
import SystemMessage from "../chat/SystemMessage";

interface ChatListItemProps {
  chat: ChatResponse;
  isCompact?: boolean;
  currentUserId: string;
}

const ChatListItem: React.FC<ChatListItemProps> = React.memo(
  ({ chat, isCompact = false, currentUserId = "" }) => {
    const getDraftMessage = useMessageStore((state) => state.getDraftMessage);
    const setActiveChatById = useChatStore.getState().setActiveChatById;
    const typingUsers = useTypingUsersByChatId(chat.id);
    const isOnline = useChatStatus(chat?.id, chat.type);
    const isActive = useIsActiveChat(chat.id);
    const unreadCount = chat.unreadCount || 0;
    const lastMessage = chat.lastMessage;
    const { isBlockedByMe } = useBlockStatus(chat.id, chat.myMemberId);

    const handleClick = () => {
      if (!isActive) {
        setActiveChatById(chat.id);
      }
    };

    const getUserItemClass = () => {
      const baseClasses =
        "relative flex items-center w-full h-24 gap-3 p-3 transition-all duration-300 ease-in-out cursor-pointer";
      const activeClasses = isActive
        ? "bg-[var(--active-chat-color)]"
        : "hover:bg-[var(--hover-color)]";
      return `${baseClasses} ${activeClasses}`;
    };

    const draft = getDraftMessage(chat.id);
    const displayMessage = draft ? (
      <p className="text-[var(--primary-green)] flex items-center gap-1 overflow-hidden max-w-[196px]">
        <i className="material-symbols-outlined flex items-center justify-center text-[16px] h-3">
          edit
        </i>
        <span className="text-xs truncate">{draft}</span>
      </p>
    ) : lastMessage ? (
      lastMessage.systemEvent ? (
        // System message
        <SystemMessage
          isSidebar={true}
          systemEvent={lastMessage.systemEvent}
          senderId={lastMessage.senderId}
          senderDisplayName={lastMessage.senderDisplayName}
          content={lastMessage.content}
        />
      ) : (
        <p
          className={`flex items-center gap-1 text-xs max-w-[196px] min-h-6 
          ${unreadCount > 0 ? "opacity-100" : "opacity-40"}
        `}
        >
          {lastMessage.senderId === currentUserId ? (
            <strong>Me:</strong>
          ) : chat.type !== ChatType.DIRECT ? (
            <strong>{lastMessage.senderDisplayName}:</strong>
          ) : null}

          {/* If forwarded */}
          {lastMessage.isForwarded && (
            <span className="material-symbols-outlined rotate-90">
              arrow_warm_up
            </span>
          )}

          {lastMessage.icons?.length ? (
            <span className="flex gap-1 truncate">
              {lastMessage.icons.map((icon, index) => (
                <i
                  key={index}
                  className={`material-symbols-outlined text-base`}
                  aria-hidden="true"
                >
                  {icon}
                </i>
              ))}
            </span>
          ) : (
            <span className="truncate">{lastMessage.content}</span>
          )}
        </p>
      )
    ) : null;

    return (
      <>
        <div className={getUserItemClass()} onClick={handleClick}>
          {!chat.isDeleted && (
            <OnlineDot
              isOnline={isOnline}
              className={`absolute top-1/2 left-[3px] -translate-y-1/2 ${
                isActive && "bg-white border"
              }`}
            />
          )}
          <ChatAvatar chat={chat} type="sidebar" isBlocked={isBlockedByMe} />

          {!isCompact && (
            <>
              <div className="flex flex-col justify-center gap-1">
                <h1
                  className={`text-lg font-semibold whitespace-nowrap text-ellipsis ${
                    chat.isDeleted ? "text-yellow-500/80" : ""
                  }`}
                >
                  {chat.isDeleted && <span className="font-bold mr-1">!</span>}
                  {chat.name}
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

              <div className="flex gap-1 absolute top-2 right-4 text-xs opacity-40">
                <p className="">
                  {formatTimeAgo(lastMessage?.createdAt ?? chat.updatedAt)}
                </p>
                <AnimatePresence>
                  {chat.mutedUntil && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, scale: 3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        notifications_off
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {unreadCount > 0 && (
                <div className="absolute bottom-6 right-4 font-bold text-white bg-red-500 rounded-full text-xs flex items-center justify-center ml-auto w-4 h-4">
                  {unreadCount}
                </div>
              )}
            </>
          )}
        </div>

        {!isCompact && <div className="w-[90%] mx-auto custom-border-b"></div>}
      </>
    );
  }
);

export default React.memo(ChatListItem);
