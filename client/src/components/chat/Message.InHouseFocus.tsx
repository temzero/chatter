import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useCurrentUserId } from "@/stores/authStore";
import RenderMultipleAttachments from "../ui/RenderMultipleAttachments";
import { formatTime } from "@/utils/formatTime";
import { Avatar } from "../ui/avatar/Avatar";
import type { MessageResponse } from "@/types/responses/message.response";
import { ChatType } from "@/types/enums/ChatType";
import { MessageReactionDisplay } from "../ui/MessageReactionsDisplay";
import MessageReplyPreview from "../ui/MessageReplyPreview";
import ForwardedMessagePreview from "../ui/ForwardMessagePreview";
import { MessageActions } from "../ui/MessageActions";
import { ReactionPicker } from "../ui/MessageReactionPicker";
import { handleQuickReaction } from "@/utils/quickReaction";
import { useIsReplyToThisMessage } from "@/stores/modalStore";
import Overlay from "../modal/Overlay";

const messageAnimations = {
  myMessage: {
    initial: { opacity: 0, scale: 0.1, x: 100, y: 0 },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 29 },
  },
  otherMessage: {
    initial: { opacity: 0, scale: 0.1, x: -200, y: 30 },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    transition: { type: "spring", stiffness: 222, damping: 20 },
  },
  none: {
    initial: false,
    animate: false,
    transition: {},
  },
};

const MessageContent = ({
  content,
  onCopy,
  copied,
}: {
  content?: string;
  onCopy: () => void;
  copied: boolean;
}) => {
  if (!content) return null;

  return (
    <p
      className={classNames(
        "break-words max-w-full cursor-pointer transition-all duration-200",
        {
          "scale-110 opacity-60": copied,
        }
      )}
      onClick={onCopy}
    >
      {content}
    </p>
  );
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
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const isRelyToThisMessage = useIsReplyToThisMessage(message.id);

  const repliedMessage = message.replyToMessage;
  const forwardedMessage = message.forwardedFromMessage;

  const [copied, setCopied] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);
  console.log("IsFocus", isFocus);

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

  const animationProps = shouldAnimate
    ? isMe
      ? messageAnimations.myMessage
      : messageAnimations.otherMessage
    : messageAnimations.none;

  const isGroupChat = chatType === "group";
  const attachments = message.attachments || [];

  return (
    <motion.div
      id={`message-${message.id}`}
      ref={messageRef}
      className={classNames("flex max-w-[60%] group relative", {
        "ml-auto": isMe,
        "mr-auto": !isMe,
        "pb-1": isRecent,
        "pb-2": !isRecent,
        "z-[99]": isFocus,
      })}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
      onContextMenu={(e) => {
        e.preventDefault();
        setIsFocus(true);
      }}
    >
      {isFocus && <Overlay onClick={() => setIsFocus(false)} />}
      {isGroupChat && !isMe && (
        <div className="flex-shrink-0 mt-auto mr-2 h-10 w-10 min-w-10">
          {!isRecent && (
            <Avatar
              avatarUrl={message.sender.avatarUrl}
              name={message.sender.displayName}
            />
          )}
        </div>
      )}

      <div className="flex flex-col w-full">
        <div
          className={classNames("relative flex flex-col transition-all", {
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
            <div
              className={classNames("message-bubble", {
                "self-message ml-auto": isMe,
                "scale-110": copied,
                "message-bubble-reply": isRelyToThisMessage,
              })}
              style={{
                width:
                  attachments.length === 1
                    ? "var(--attachment-width)"
                    : attachments.length > 1
                    ? "var(--attachment-width-large)"
                    : undefined,
              }}
            >
              {forwardedMessage && (
                <ForwardedMessagePreview
                  message={forwardedMessage}
                  currentUserId={currentUserId ?? undefined}
                  isMe={isMe}
                />
              )}
              <RenderMultipleAttachments attachments={attachments} />
              <MessageContent
                content={message.content ?? undefined}
                onCopy={handleCopyText}
                copied={copied}
              />
            </div>

            <MessageReactionDisplay
              isMe={isMe}
              currentUserId={currentUserId}
              messageId={message.id}
              chatId={message.chatId}
            />

            {isFocus && !isRelyToThisMessage && (
              <>
                <ReactionPicker
                  messageId={message.id}
                  chatId={message.chatId}
                  isMe={isMe}
                  onClose={() => setIsFocus(false)}
                />
                <MessageActions
                  message={message}
                  isMe={isMe}
                  onClose={() => setIsFocus(false)}
                />
              </>
            )}
          </div>
        </div>

        {showInfo && isGroupChat && !isMe && (
          <h1 className="text-sm font-semibold opacity-70 mr-2">
            {message.sender.displayName}
          </h1>
        )}

        {!isRecent && (
          <p
            className={classNames("text-xs py-1 opacity-40", {
              "ml-auto": isMe,
              "mr-auto": !isMe,
            })}
          >
            {formatTime(message.createdAt)}
          </p>
        )}

        {readUserAvatars && (
          <div
            className={classNames("flex items-center", {
              "justify-end": isMe,
              "justify-start": !isMe,
            })}
          >
            {readUserAvatars.map((avatarUrl, index) => (
              <div key={index}>
                <Avatar
                  avatarUrl={avatarUrl}
                  name={message.sender.displayName}
                  size="5"
                  id={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(Message);
