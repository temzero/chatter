import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useMessageReactions, useMessageStore } from "@/stores/messageStore";
import { useCurrentUser } from "@/stores/authStore";
import RenderMultipleMedia from "../ui/RenderMultipleMedia";
import { formatTime } from "@/utils/formatTime";
import { Avatar } from "../ui/avatar/Avatar";
import type { MessageResponse } from "@/types/messageResponse";
import { ChatType } from "@/types/enums/ChatType";
import { ReactionPicker } from "../ui/MessageReactionPicker";
import { MessageActions } from "../ui/MessageActions";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { MessageReactionDisplay } from "../ui/MessageReactionsDisplay";

const myMessageAnimation = {
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
  chatType = ChatType.DIRECT,
  shouldAnimate = false,
  showInfo = true,
  isRecent = false,
  readUserAvatars,
}) => {
  const currentUser = useCurrentUser();
  const isMe = message.senderId === currentUser?.id;
  const deleteMessage = useMessageStore((state) => state.deleteMessage);
  // const reactions = message.reactions;
  const reactions = useMessageReactions(message.id);
  console.log("reactions: ", reactions);

  const [copied, setCopied] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);

  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 200);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        messageRef.current &&
        !messageRef.current.contains(event.target as Node)
      ) {
        setShowActionButtons(false);
        setShowReactionPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCopyText = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
  };

  const handleReaction = (emoji: string) => {
    if (!currentUser) return;

    chatWebSocketService.reactToMessage({
      messageId: message.id,
      chatId: message.chatId,
      emoji,
      userId: currentUser.id,
    });

    setShowReactionPicker(false);
  };

  const animationProps = shouldAnimate
    ? isMe
      ? myMessageAnimation
      : otherMessageAnimation
    : noAnimation;

  const isGroupChat = chatType === "group";

  const alignmentClass = {
    "ml-auto": isMe,
    "mr-auto": !isMe,
    "pb-1": isRecent,
    "pb-8": !isRecent,
  };

  const displayName = message.senderNickname || message.senderFirstName;

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
      ref={messageRef}
      className={classNames("flex max-w-[60%] group", alignmentClass)}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      onMouseEnter={() => {
        if (!showActionButtons) {
          setShowReactionPicker(true);
        }
      }}
      onMouseLeave={() => {
        setShowReactionPicker(false);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowActionButtons(true);
        setShowReactionPicker(false);
      }}
    >
      {isGroupChat &&
        (showInfo && !isMe ? (
          <div className="mt-auto mr-1 h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full object-cover custom-border overflow-hidden">
            <Avatar
              avatarUrl={message.senderAvatarUrl}
              name={message.senderFirstName}
            />
          </div>
        ) : (
          <div className="w-10 mr-1"></div>
        ))}

      <div className="flex relative flex-col">
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

        <MessageReactionDisplay reactions={reactions} isMe={isMe} />

        {showInfo && isGroupChat && !isMe && (
          <h1 className="text-sm font-semibold opacity-70 mr-2">
            {displayName}
          </h1>
        )}

        {!isRecent && (
          <p
            className={`opacity-0 group-hover:opacity-40 text-xs ${
              isMe ? "ml-auto" : "mr-auto"
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        )}

        {readUserAvatars && (
          <div
            className={`flex ${
              isMe ? "justify-end" : "justify-start"
            } items-center`}
          >
            {readUserAvatars.map((avatarUrl, index) => (
              <div key={index}>
                <Avatar
                  avatarUrl={avatarUrl}
                  name={displayName}
                  size="5"
                  id={index}
                />
              </div>
            ))}
          </div>
        )}

        {/* Emoji Picker on Hover */}
        {showReactionPicker && (
          <ReactionPicker
            onSelect={handleReaction}
            position={isMe ? "right" : "left"}
          />
        )}

        {/* Action Buttons on Right Click */}
        {showActionButtons && (
          <MessageActions
            onDelete={() => deleteMessage(message.id)}
            position={isMe ? "left" : "right"}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Message;
