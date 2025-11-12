import React, { useState, useRef, useLayoutEffect } from "react";
import { useLastMessage } from "@/stores/messageStore";
import { useTypingUsersByChatId } from "@/stores/typingStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { formatTimeAgo } from "@/common/utils/format/formatTimeAgo";
import { OnlineDot } from "@/components/ui/icons/OnlineDot";
import { AnimatePresence, motion } from "framer-motion";
import { useChat, useChatStore, useIsActiveChat } from "@/stores/chatStore";
import { useChatStatus } from "@/stores/presenceStore";
import { useBlockStatus } from "@/common/hooks/useBlockStatus";
import { ChatListItemContextMenu } from "./ChatListItem-contextMenu";
import { calculateContextMenuPosition } from "@/common/utils/contextMenuUtils";
import { useClickOutside } from "@/common/hooks/keyEvent/useClickOutside";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { ChatListItemMessage } from "./ChatListItemMessage";
import SimpleTypingIndicator from "@/components/ui/typingIndicator/SimpleTypingIndicator";
import { useTranslation } from "react-i18next";

// Keep track of open menu globally
let openMenuSetter: (() => void) | null = null;

interface ChatListItemProps {
  chatId: string;
  isCompact?: boolean;
  currentUserId: string;
}

const ChatListItem: React.FC<ChatListItemProps> = React.memo(
  ({ chatId, isCompact = false, currentUserId = "" }) => {
    // logger.log({ prefix: "MOUNTED" }, "ChatListItem", chatId);

    const { t } = useTranslation();
    // This now uses the updated useChat hook that works with Record structure
    const chat = useChat(chatId);
    const isActive = useIsActiveChat(chatId);

    const typingUsers = useTypingUsersByChatId(chatId);
    const isOnline = useChatStatus(chatId, chat?.type);
    const unreadMessagesCount = chat?.unreadCount || 0;
    // const lastMessage = chat?.lastMessage;
    const lastMessage = useLastMessage(chatId);
    const { isBlockedByMe } = useBlockStatus(chatId, chat?.myMemberId);

    const setActiveChatId = useChatStore.getState().setActiveChatId;

    useLayoutEffect(() => {
      useChatStore.getState().setUnreadCount(chatId, 0);
    }, [chatId, isActive]);

    // ======== Context Menu ========
    const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Close menu when clicking outside
    useClickOutside(menuRef, () => {
      if (contextMenu) handleCloseContextMenu();
    });

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (openMenuSetter) openMenuSetter();
      openMenuSetter = () => setContextMenu(null);

      const menuWidth = 180;
      const menuHeight = 160;

      const position = calculateContextMenuPosition(
        { x: e.clientX, y: e.clientY },
        menuWidth,
        menuHeight
      );

      setContextMenu(position.position);
    };

    if (!chat) return null;

    const handleCloseContextMenu = () => {
      setContextMenu(null);
      if (openMenuSetter) openMenuSetter = null;
    };

    // ======== Middle Click (Open in New Tab) ========
    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        window.open(`/${chatId}`, "_blank");
      }
    };

    const getUserItemClass = () => {
      const baseClasses =
        "relative flex items-center w-full h-24 gap-3 p-3 transition-all duration-300 ease-in-out custom-border-b cursor-pointer";
      const activeClasses = isActive
        ? "bg-[var(--active-chat-color)]"
        : "hover:bg-[var(--hover-color)]";
      return `${baseClasses} ${activeClasses}`;
    };

    return (
      <>
        <div
          className={getUserItemClass()}
          onClick={() => setActiveChatId(chatId)}
          onMouseDown={handleMouseDown}
          onContextMenu={handleContextMenu}
        >
          <OnlineDot
            isOnline={isOnline}
            className={`absolute top-1/2 left-[3px] -translate-y-1/2`}
          />
          <ChatAvatar chat={chat} type="sidebar" isBlocked={isBlockedByMe} />

          {!isCompact && (
            <div className="flex flex-col flex-1 min-w-0 gap-1">
              <div className="flex items-center justify-between">
                <h1
                  className={`text-lg font-semibold whitespace-nowrap text-ellipsis flex-1 min-w-0 ${
                    chat.isDeleted ? "text-yellow-500/80" : ""
                  }`}
                >
                  {chat.isDeleted && <span className="font-bold mr-1">!</span>}
                  {chat.name}
                </h1>

                <div className="flex gap-1 text-xs items-center flex-shrink-0 ml-2">
                  <p className="whitespace-nowrap opacity-50">
                    {formatTimeAgo(
                      t,
                      (lastMessage?.createdAt as string | Date | undefined) ??
                        (chat.updatedAt as string | Date)
                    )}
                  </p>
                  <div className="flex items-center absolute top-1.5 right-2">
                    {/* Muted icon */}
                    <AnimatePresence>
                      {chat.mutedUntil && (
                        <motion.div
                          key="muted"
                          initial={{ opacity: 0, scale: 3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="material-symbols-outlined filled text-[18px] text-yellow-500">
                            notifications_off
                          </span>
                        </motion.div>
                      )}

                      {/* Pinned icon */}
                      <AnimatePresence>
                        {chat.pinnedAt && (
                          <motion.div
                            key="pinned"
                            initial={{ opacity: 0, scale: 3 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <span className="material-symbols-outlined filled text-[20px] rotate-45 text-red-500">
                              keep
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between min-h-6">
                <div className="flex-1 min-w-0 mr-2">
                  <AnimatePresence mode="wait" initial={false}>
                    {typingUsers.length > 0 ? (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="min-w-0"
                      >
                        <SimpleTypingIndicator
                          chatId={chatId}
                          userIds={typingUsers}
                        />
                      </motion.div>
                    ) : (
                      <ChatListItemMessage
                        chatId={chatId}
                        lastMessage={lastMessage}
                        unreadMessagesCount={unreadMessagesCount}
                        chatType={chat.type}
                        currentUserId={currentUserId}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {!isActive && unreadMessagesCount > 0 && (
                    <motion.div
                      key="unread-count"
                      className="flex-shrink-0 font-semibold text-white bg-red-500 rounded-full text-xs flex items-center justify-center p-1 h-4"
                      {...messageAnimations.messagesCount}
                    >
                      {unreadMessagesCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {contextMenu && (
          <ChatListItemContextMenu
            ref={menuRef}
            x={contextMenu.x}
            y={contextMenu.y}
            chat={chat}
            onClose={handleCloseContextMenu}
          />
        )}
      </>
    );
  }
);

export default React.memo(ChatListItem);
