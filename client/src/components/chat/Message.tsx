import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useMessageStore } from "@/stores/messageStore";
import { useCurrentUser } from "@/stores/authStore";
import RenderMultipleMedia from "../ui/RenderMultipleMedia";
import { formatTime } from "@/utils/formatTime";
import { Avatar } from "../ui/avatar/Avatar";
import type { MessageResponse } from "@/types/messageResponse";
import { ChatType } from "@/types/enums/ChatType";

// Animation configurations
const myMessageAnimation = {
  // initial: { opacity: 0, scale: 0.1, x: -1000, y: 160 },
  initial: { opacity: 0, scale: 0.1, x: 100, y: 0 },
  animate: { opacity: 1, scale: 1, x: 0, y: 0 },
  transition: { type: "spring", stiffness: 300, damping: 29 },
};

const otherMessageAnimation = {
  initial: { opacity: 0, scale: 0.1, x: -200, y: 30 },
  animate: { opacity: 1, scale: 1, x: 0, y: 0 },
  transition: { type: "spring", stiffness: 222, damping: 20 },
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
  showInfo?: boolean;
  isRecent?: boolean;
  isRead?: boolean;
  readUserAvatars?: string[];
}

const Message: React.FC<MessageProps> = ({
  message,
  chatType = ChatType.DIRECT, // Default to direct chat
  shouldAnimate = false,
  showInfo = true,
  isRecent = false,
  readUserAvatars,
}) => {
  const currentUser = useCurrentUser();
  const isMe = message.senderId === currentUser?.id;
  const deleteMessage = useMessageStore((state) => state.deleteMessage);

  const [copied, setCopied] = useState(false);

  const isGroupChat = chatType === "group";

  const alignmentClass = {
    "ml-auto": isMe,
    "mr-auto": !isMe,
    "pb-1": isRecent, // messages in middle of sequence
    "pb-8": !isRecent, // standalone messages or end of sequence
  };

  const iconAlignmentClass = {
    "absolute -bottom-1 -left-2 flex-row-reverse": isMe,
    "absolute -bottom-1 -right-2": !isMe,
  };

  const displayName = message.senderNickname || message.senderFirstName;

  // `${message.senderFirstName} ${message.senderLastName}`;

  // Handle copy text
  const handleCopyText = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 200);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  // Determine animation
  const animationProps = shouldAnimate
    ? isMe
      ? myMessageAnimation
      : otherMessageAnimation
    : noAnimation;

  // Convert attachments to media props if needed
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

  return (
    <motion.div
      className={classNames("flex max-w-[60%] group", alignmentClass)}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
    >
      {isGroupChat &&
        (showInfo && !isMe ? (
          <div className="mt-auto mr-1 h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full object-cover custom-border overflow-hidden">
            <Avatar
              avatarUrl={message.senderAvatarUrl}
              firstName={message.senderFirstName}
              lastName={message.senderLastName}
            />
          </div>
        ) : (
          <div className="w-10 mr-1"></div>
        ))}

      <div className="flex relative flex-col">
        {/* Media and Text */}
        {media.length > 0 ? (
          <div
            className={classNames("message-media-bubble", {
              "self-message ml-auto": isMe,
            })}
            style={{
              width:
                media.length === 1
                  ? "var(--media-width)"
                  : "var(--media-width-large)",
            }}
          >
            <RenderMultipleMedia media={media} />
            {message.content && (
              <h1
                className={`p-2 break-words max-w-full cursor-pointer transition-all duration-200
                  ${copied ? "scale-110 opacity-60" : ""}
                `}
                onClick={handleCopyText}
              >
                {message.content}
              </h1>
            )}
          </div>
        ) : (
          <div
            className={classNames(
              "message-bubble cursor-pointer transition-all duration-200",
              { "self-message ml-auto": isMe },
              { "scale-110": copied }
            )}
          >
            <h1
              className={`break-words max-w-full cursor-pointer transition-all duration-200
                ${copied ? "scale-110 opacity-60" : ""}
              `}
              onClick={handleCopyText}
            >
              {message.content}
            </h1>
          </div>
        )}

        {/* Sender Info */}
        {showInfo && isGroupChat && !isMe && (
          <h1 className="text-sm font-semibold opacity-70 mr-2">
            {displayName}
          </h1>
        )}

        {!isRecent && (
          <p className="opacity-0 group-hover:opacity-40 text-xs">
            {formatTime(message.createdAt)}
          </p>
        )}
        {readUserAvatars && (
          <div
            className={`flex ${
              isMe ? "justify-end" : "justify-start"
            } items-center gap-1`}
          >
            {readUserAvatars.map((avatarUrl, index) => (
              <div key={index}>
                <Avatar
                  avatarUrl={avatarUrl}
                  firstName="F"
                  lastName="L"
                  size="5"
                  id={index}
                />
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div
          className={classNames(
            "flex gap-1 opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer z-20",
            iconAlignmentClass
          )}
        >
          <i
            className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full"
            onClick={() => deleteMessage(message.id)}
          >
            delete
          </i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full">
            keep
          </i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full">
            send
          </i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full rotate-180">
            reply
          </i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full">
            favorite
          </i>
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
