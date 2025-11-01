import React, { useState, useRef } from "react";
import { useLastMessage, useMessageStore } from "@/stores/messageStore";
import { useTypingUsersByChatId } from "@/stores/typingStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { formatTimeAgo } from "@/common/utils/format/formatTimeAgo";
import { OnlineDot } from "@/components/ui/icons/OnlineDot";
import SimpleTypingIndicator from "@/components/ui/typingIndicator/SimpleTypingIndicator";
import { AnimatePresence, motion } from "framer-motion";
import { useChat, useChatStore, useIsActiveChat } from "@/stores/chatStore";
import { useChatStatus } from "@/stores/presenceStore";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useBlockStatus } from "@/common/hooks/useBlockStatus";
import {
  SystemMessageContent,
  SystemMessageJSONContent,
} from "@/components/ui/messages/SystemMessageContent";
import { ChatListItemContextMenu } from "./ChatListItem-contextMenu";
import { calculateContextMenuPosition } from "@/common/utils/contextMenuUtils";
import { useClickOutside } from "@/common/hooks/keyEvent/useClickOutside";
import { getAttachmentIcons } from "@/common/utils/getFileIcon";

// Keep track of open menu globally
let openMenuSetter: (() => void) | null = null;

interface ChatListItemProps {
  chatId: string;
  isCompact?: boolean;
  currentUserId: string;
}

const ChatListItem: React.FC<ChatListItemProps> = React.memo(
  ({ chatId, isCompact = false, currentUserId = "" }) => {
    // console.log("ChatListItem", chatId);

    // This now uses the updated useChat hook that works with Record structure
    const chat = useChat(chatId);
    const isActive = useIsActiveChat(chatId);

    const typingUsers = useTypingUsersByChatId(chatId);
    const isOnline = useChatStatus(chatId, chat?.type);
    const unreadCount = chat?.unreadCount || 0;
    // const lastMessage = chat?.lastMessage;
    const lastMessage = useLastMessage(chatId);
    const { isBlockedByMe } = useBlockStatus(chatId, chat?.myMemberId);

    const getDraftMessage = useMessageStore.getState().getDraftMessage;
    const setActiveChatId = useChatStore.getState().setActiveChatId;

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

    const draft = getDraftMessage(chatId);

    const displayMessage = draft ? (
      <p className="text-[var(--primary-green)] flex items-center gap-1 overflow-hidden flex-1 min-w-0">
        <i className="material-symbols-outlined flex items-center justify-center text-[16px] h-3">
          edit
        </i>
        <span className="text-xs truncate">{draft}</span>
      </p>
    ) : lastMessage ? (
      lastMessage.systemEvent ? (
        <SystemMessageContent
          systemEvent={lastMessage.systemEvent}
          call={lastMessage.call}
          isBroadcast={chat.type === ChatType.CHANNEL}
          currentUserId={currentUserId}
          senderId={lastMessage.sender.id}
          senderDisplayName={lastMessage.sender.displayName}
          JSONcontent={lastMessage.content as SystemMessageJSONContent}
          ClassName="gap-1 truncate opacity-60 flex-1 min-w-0"
        />
      ) : (
        <p
          className={`flex items-center gap-1 text-xs min-h-6 flex-1 min-w-0
      ${unreadCount > 0 ? "opacity-100" : "opacity-40"}`}
        >
          {lastMessage.sender.id === currentUserId ? (
            <strong>Me:</strong>
          ) : chat.type !== ChatType.DIRECT ? (
            <strong>{lastMessage.sender.displayName.split(" ")[0]}:</strong>
          ) : null}

          {lastMessage.forwardedFromMessage && (
            <span className="material-symbols-outlined rotate-90">
              arrow_warm_up
            </span>
          )}

          {lastMessage.attachments?.length ? (
            <span className="flex gap-1 truncate">
              {getAttachmentIcons(lastMessage.attachments)?.map(
                (icon, index) => (
                  <i
                    key={index}
                    className="material-symbols-outlined text-base"
                    aria-hidden="true"
                  >
                    {icon}
                  </i>
                )
              )}
            </span>
          ) : (
            <span className="truncate">{lastMessage.content}</span>
          )}
        </p>
      )
    ) : null;

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
                      <motion.div
                        key="message"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="min-w-0"
                      >
                        {displayMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {unreadCount > 0 && (
                  <div className="flex-shrink-0 font-bold text-white bg-red-500 rounded-full text-xs flex items-center justify-center w-4 h-4">
                    {unreadCount}
                  </div>
                )}
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
