// components/ui/messages/MessageBubbleWrapper.tsx
import * as React from "react";
import { useState } from "react";
import clsx from "clsx";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { MessageTail } from "../messageTail";
import { MessageReactionDisplay } from "@/components/ui/messages/MessageReactionsDisplay";
import MessagePinnedIcon from "../MessagePinnedIcon";
import { setOpenFocusMessageModal } from "@/stores/modalStore";
import { MessageContextMenu } from "@/components/ui/contextMenu/Message-contextMenu";
import { AnimatePresence } from "framer-motion";

interface MessageBubbleWrapperProps {
  message: MessageResponse;
  isChannel?: boolean;
  isMe?: boolean;
  idDisplayTail?: boolean;
  isReplyToThisMessage?: boolean;
  isFocus?: boolean;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  children: React.ReactNode;
}

const MessageBubbleWrapper: React.FC<MessageBubbleWrapperProps> = ({
  message,
  isMe = false,
  isChannel = false,
  isReplyToThisMessage = false,
  idDisplayTail = false,
  isFocus = false,
  className,
  onClick,
  onDoubleClick,
  children,
}) => {
  const [contextMenuMousePos, setContextMenuMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFocusMessageModal(message.id);
    setContextMenuMousePos({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenuMousePos(null);

  const isFailed = message.status === MessageStatus.FAILED;
  const isDirectMessage = !isChannel;
  const showContextMenu = isFocus && !isReplyToThisMessage && contextMenuMousePos;

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={handleContextMenu}
      className={clsx(
        "relative flex flex-col",
        isDirectMessage && (isMe ? "items-end" : "items-start"),
      )}
    >
      <div
        className={clsx(
          isChannel
            ? "custom-border bg-(--message-color) rounded-xl"
            : "message-bubble w-full",
          "overflow-hidden object-cover",
          {
            "self-message": isDirectMessage && isMe,
            "border-6 rounded-xl! border-yellow-400": message.isImportant,
            "message-bubble-reply": isReplyToThisMessage,
            "opacity-60 border-2 border-red-500": isFailed,
            "cursor-pointer": !!onClick,
          },
          className,
        )}
      >
        {children}
      </div>

      {idDisplayTail && isDirectMessage && <MessageTail isMe={isMe} />}

      {message.isPinned && (
        <MessagePinnedIcon
          chatId={message.chatId}
          isMe={isDirectMessage ? isMe : true}
        />
      )}

      <MessageReactionDisplay
        isMe={isDirectMessage ? isMe : undefined}
        isChannel={isChannel}
        messageId={message.id}
        chatId={message.chatId}
      />

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <MessageContextMenu
            key={message.id}
            message={message}
            isChannel={isChannel}
            isMe={isMe}
            isSystemMessage={!!message.systemEvent}
            initialMousePosition={contextMenuMousePos}
            onClose={closeContextMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageBubbleWrapper;
