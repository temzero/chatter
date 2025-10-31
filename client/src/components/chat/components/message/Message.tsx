import React, { useState, useRef, useMemo } from "react";
import clsx from "clsx";
import { formatTime } from "@/common/utils/format/formatTime";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageReactionDisplay } from "@/components/ui/messages/MessageReactionsDisplay";
import { handleQuickReaction } from "@/common/utils/message/quickReaction";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { BeatLoader } from "react-spinners";
import { SystemMessageJSONContent } from "@/components/ui/messages/SystemMessageContent";
import { MessageContextMenu } from "./MessageContextMenu";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  setOpenFocusMessageModal,
} from "@/stores/modalStore";
import MessageReplyPreview from "@/components/ui/messages/MessageReplyPreview";
import SystemMessage from "./SystemMessage";
import MessageBubble from "./MessageBubble";
import CallMessageBubble from "./CallMessageBubble";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { AnimatePresence, motion } from "framer-motion";
import { getMessageAnimation } from "@/common/animations/messageAnimations";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";

interface MessageProps {
  messageId: string;
  chatType?: ChatType;
  showInfo?: boolean;
  isRecent?: boolean;
  isRead?: boolean;
  readUserAvatars?: string[];
  currentUserId?: string;
  isMe?: boolean;
}

const Message: React.FC<MessageProps> = ({
  messageId,
  chatType = ChatType.DIRECT,
  showInfo = true,
  isRecent = false,
  currentUserId,
  isMe = false,
}) => {
  const message = useMessageStore((state) => state.messagesById[messageId]);

  const searchQuery = useMessageStore((state) => state.searchQuery);
  const showImportantOnly = useMessageStore((state) => state.showImportantOnly);

  const isFocus = useIsMessageFocus(messageId);
  const isRelyToThisMessage = useIsReplyToThisMessage(messageId);

  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenuMousePos, setContextMenuMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFocusMessageModal(messageId);
    setContextMenuMousePos({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuMousePos(null);
  };

  const isGroupChat = chatType === "group";

  const messageAnimation = useMemo(() => {
    if (!message) return {}; // fallback if message is undefined
    return message.shouldAnimate ? getMessageAnimation(isMe) : {};
  }, [message, isMe]);

  if (!message) return null;
  const repliedMessage = message.replyToMessage;

  if (
    searchQuery.trim() !== "" &&
    !message.content?.toLowerCase().includes(searchQuery.toLowerCase())
  ) {
    return null;
  }

  // Manage filtering
  const contentText = message.content?.toString().toLowerCase() ?? "";
  const notMatchingSearch =
    searchQuery.trim() !== "" &&
    !contentText.includes(searchQuery.toLowerCase());
  const notImportant = showImportantOnly && !message.isImportant;
  if (notMatchingSearch || notImportant) {
    return null;
  }

  // system message
  if (message.systemEvent && message.systemEvent !== SystemEventType.CALL) {
    return (
      <div className="w-full flex items-center justify-center">
        <SystemMessage
          message={message}
          systemEvent={message.systemEvent}
          senderId={message.sender.id}
          senderDisplayName={message.sender.displayName}
          content={message.content as SystemMessageJSONContent}
        />
      </div>
    );
  }

  return (
    <motion.div
      id={`message-${messageId}`}
      ref={messageRef}
      onDoubleClick={() => handleQuickReaction(messageId, message.chatId)}
      onContextMenu={handleContextMenu}
      className={clsx("flex relative max-w-[60%] pb-1.5", {
        "justify-end": isMe,
        "justify-start": !isMe,
      })}
      style={{ zIndex: isFocus || isRelyToThisMessage ? 100 : "auto" }}
      layout="position"
      {...messageAnimation}
    >
      {isGroupChat && !isMe && (
        <div className={clsx("flex-shrink-0 mt-auto mr-2 h-10 w-10 min-w-10")}>
          {!isRecent && (
            <Avatar
              avatarUrl={message.sender.avatarUrl}
              name={message.sender.displayName}
            />
          )}
        </div>
      )}

      <div className="flex flex-col ">
        <div
          className={clsx("relative flex flex-col transition-all", {
            "scale-[1.1]": isRelyToThisMessage,
            "origin-bottom-right items-end": isMe,
            "origin-bottom-left items-start": !isMe,
          })}
        >
          {repliedMessage && (
            <MessageReplyPreview
              replyMessage={repliedMessage}
              chatType={chatType}
              isMe={isMe}
              currentUserId={currentUserId ?? ""}
              senderId={message.sender.id}
              isHidden={isFocus}
            />
          )}

          <div className="relative">
            {message.call ? (
              <CallMessageBubble message={message} isMe={isMe} />
            ) : (
              <MessageBubble
                message={message}
                isMe={isMe}
                isRelyToThisMessage={isRelyToThisMessage}
                currentUserId={currentUserId ?? ""}
              />
            )}

            <MessageReactionDisplay
              isMe={isMe}
              currentUserId={currentUserId}
              messageId={messageId}
              chatId={message.chatId}
            />

            <AnimatePresence>
              {isFocus && !isRelyToThisMessage && contextMenuMousePos && (
                <MessageContextMenu
                  key={messageId}
                  message={message}
                  isMe={isMe}
                  initialMousePosition={contextMenuMousePos}
                  onClose={closeContextMenu}
                />
              )}
            </AnimatePresence>

            {message.isPinned && (
              <div
                className={clsx(
                  "absolute top-0 text-red-400 rounded-full cursor-pointer hover:scale-110 transition-all",
                  {
                    "-left-5 rotate-[-45deg]": isMe,
                    "-right-5 rotate-45": !isMe,
                  }
                )}
                onClick={() => {
                  chatWebSocketService.togglePinMessage({
                    chatId: message.chatId,
                    messageId: null,
                  });
                }}
              >
                <span className="material-symbols-outlined filled">keep</span>
              </div>
            )}
          </div>
        </div>

        {showInfo && isGroupChat && !isMe && (
          <h1 className={clsx("text-sm font-semibold opacity-70 mr-2")}>
            {message.sender.displayName}
          </h1>
        )}

        {!isRecent &&
          message.status !== MessageStatus.SENDING &&
          message.status !== MessageStatus.FAILED && (
            <p
              className={clsx("text-xs opacity-40 p-0.5 pb-0", {
                "ml-auto": isMe,
                "mr-auto": !isMe,
              })}
            >
              {formatTime(message.createdAt)}
            </p>
          )}

        {message.status === MessageStatus.SENDING && (
          <div className="rounded-full flex justify-end mt-1">
            <BeatLoader color="gray" size={8} />
          </div>
        )}
        {message.status === MessageStatus.FAILED && (
          <h1 className="text-red-500 text-sm text-right">
            Failed to send message
          </h1>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(Message);
