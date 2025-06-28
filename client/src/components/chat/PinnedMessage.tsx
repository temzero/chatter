import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useCurrentUserId } from "@/stores/authStore";
import { formatTime } from "@/utils/formatTime";
import { Avatar } from "../ui/avatar/Avatar";
import type { MessageResponse } from "@/types/messageResponse";
import { ChatType } from "@/types/enums/ChatType";
import { scrollToMessageById } from "@/utils/scrollToMessageById";

const pinMessageAnimation = {
  initial: { opacity: 0, scale: 0.1, x: 100, y: 0 },
  animate: { opacity: 1, scale: 1, x: 0, y: 0 },
  transition: { type: "spring", stiffness: 300, damping: 29 },
};

const noAnimation = {
  initial: false,
  animate: false,
  transition: {},
};

interface MessageProps {
  message: MessageResponse;
  chatType?: ChatType;
  shouldAnimate?: boolean;
  isBanner?: boolean;
  onUnpin?: () => void;
}

const PinnedMessage: React.FC<MessageProps> = ({
  message,
  chatType = ChatType.DIRECT,
  shouldAnimate = false,
  isBanner = false,
  onUnpin,
}) => {
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const forwardedMessage = message.forwardedFromMessage;
  const isForwarded = forwardedMessage !== null;

  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 200);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyText = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
  };

  const animationProps = shouldAnimate ? pinMessageAnimation : noAnimation;

  const isGroupChat = chatType === "group";

  const media =
    message.attachments?.map((attachment) => ({
      id: attachment.id,
      messageId: message.id,
      url: attachment.url,
      type: attachment.type,
      thumbnailUrl: attachment.thumbnailUrl,
      width: attachment.width,
      height: attachment.height,
      duration: attachment.duration,
    })) || [];

  const renderMessageContent = () => (
    <div
      ref={messageRef}
      className={classNames(
        "flex items-center justify-center gap-1 max-w-[80%]"
      )}
      // initial={animationProps.initial}
      // animate={animationProps.animate}
      // transition={animationProps.transition}
    >
      {isGroupChat && (
        <div
          className={classNames("flex h-6 w-6 min-w-6", {
            "flex items-center justify-center rounded-full custom-border overflow-hidden":
              !isMe,
            invisible: !!isMe,
          })}
        >
          {!isMe && (
            <Avatar
              avatarUrl={message.sender.avatarUrl}
              name={message.sender.displayName}
              size="6"
            />
          )}
        </div>
      )}

      {/* Sender Info */}
      {/* {isGroupChat && !isMe && (
        <h1 className="text-sm font-semibold opacity-70">
          {message.sender.displayName}
        </h1>
      )} */}

      <h1
        className={`break-words max-w-full cursor-pointer transition-all duration-200 ${
          copied ? "scale-110 opacity-60" : ""
        }`}
        onClick={handleCopyText}
      >
        {message.content}
      </h1>

      {isForwarded && (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined rotate-90">
            arrow_warm_up
          </span>
          {!isMe && (
            <Avatar
              avatarUrl={message.forwardedFromMessage?.sender.avatarUrl}
              name={message.forwardedFromMessage?.sender.displayName}
              size="6"
            />
          )}
          {/* <h1 className="text-sm font-semibold opacity-70 mr-2">
            {message.forwardedFromMessage?.sender.displayName}
          </h1> */}
          <p className="text-sm font-semibold opacity-70 mr-2">
            {message.forwardedFromMessage?.content}
          </p>
        </div>
      )}
    </div>
  );

  if (isBanner) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          scrollToMessageById(message.id);
        }}
        className={`absolute custom-border w-full top-[var(--header-height)] left-1/2 -translate-x-1/2 flex gap-4 p-1 px-2 items-center justify-between
           ${isMe ? "bg-[var(--primary-green)]" : "bg-[var(--message-color)]"}
          `}
      >
        <button
          className="group hover:bg-red-600 p-1 rounded-full -rotate-[25deg] custom-border"
          onClick={(e) => {
            e.stopPropagation();
            onUnpin?.();
          }}
        >
          <span className="material-symbols-outlined block group-hover:hidden">
            keep
          </span>
          <span className="material-symbols-outlined hidden group-hover:block">
            keep_off
          </span>
        </button>
        {renderMessageContent()}
        <p className={`opacity-60`}>{formatTime(message.createdAt)}</p>
      </div>
    );
  }

  return renderMessageContent();
};

export default PinnedMessage;
