import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { useMessageReactions } from "@/stores/messageStore";
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
import { useFocusMessageId, useModalStore } from "@/stores/modalStore";

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
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;
  const reactions = useMessageReactions(message.id);

  // Modal Focus overlay
  const isFocusMessageId = useFocusMessageId();
  const isFocus = isFocusMessageId === message.id;
  const { openMessageModal } = useModalStore();

  const repliedMessage = message.replyToMessage;
  const forwardedMessage = message.forwardedFromMessage;

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
    "z-[99]": isFocus,
  };

  const attachments = message.attachments || [];

  return (
    <motion.div
      id={`message-${message.id}`}
      ref={messageRef}
      className={classNames("flex max-w-[60%] group relative", alignmentClass, {
        "z-40": isFocus, // Higher than the blur modal's z-index
      })}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        openMessageModal(message.id);
      }}
    >
      {isGroupChat && (
        <div
          className={classNames(
            "flex-shrink-0 mt-auto mr-2 h-10 w-10 min-w-10"
          )}
        >
          {!isRecent && !isMe && (
            <Avatar
              avatarUrl={message.sender.avatarUrl}
              name={message.sender.displayName}
            />
          )}
        </div>
      )}

      <div className="flex relative flex-col w-full">
        {isFocus && (
          <ReactionPicker
            messageId={message.id}
            chatId={message.chatId}
            isMe={isMe}
          />
        )}
        {/* Reply Preview */}
        {repliedMessage && (
          <div
            className={classNames("-mb-1 w-full", {
              "text-right": repliedMessage.sender.id === currentUserId,
            })}
          >
            <MessageReplyPreview
              message={repliedMessage}
              chatType={chatType}
              isMe={isMe}
              isSelfReply={repliedMessage.sender.id === message.sender.id}
              isReplyToMe={repliedMessage.sender.id === currentUserId}
            />
          </div>
        )}

        {/* Main Content with switch */}
        {(() => {
          switch (true) {
            case attachments.length > 0:
              return (
                <>
                  <div
                    className={classNames("message-attachment-bubble", {
                      "self-message ml-auto": isMe,
                    })}
                    style={{
                      width:
                        attachments.length === 1
                          ? "var(--attachment-width)"
                          : "var(--attachment-width-large)",
                    }}
                  >
                    <RenderMultipleAttachments attachments={attachments} />
                    {message.content && (
                      <h1
                        className={`p-2 break-words max-w-full cursor-pointer transition-all duration-200 ${
                          copied ? "scale-110 opacity-60" : ""
                        }`}
                        onClick={handleCopyText}
                      >
                        {message.content}
                      </h1>
                    )}
                  </div>

                  {/* Render outside so it's not affected by bubble's overflow */}
                  <div className="mt-1">
                    <MessageReactionDisplay
                      reactions={reactions}
                      isMe={isMe}
                      currentUserId={currentUserId}
                      messageId={message.id}
                      chatId={message.chatId}
                    />
                  </div>
                </>
              );

            case !!forwardedMessage:
              return (
                <div
                  className={classNames(
                    "message-forward-bubble cursor-pointer transition-all duration-200",
                    { "self-message ml-auto": isMe },
                    { "scale-110": copied }
                  )}
                >
                  <ForwardedMessagePreview
                    message={forwardedMessage}
                    isMe={isMe}
                  />
                  {message.content && (
                    <h1
                      className={`break-words max-w-full cursor-pointer transition-all duration-200 ${
                        copied ? "scale-110 opacity-60" : ""
                      }`}
                      onClick={handleCopyText}
                    >
                      {message.content}
                    </h1>
                  )}

                  <MessageReactionDisplay
                    reactions={reactions}
                    isMe={isMe}
                    currentUserId={currentUserId}
                    messageId={message.id}
                    chatId={message.chatId}
                  />
                </div>
              );

            default:
              return (
                <div
                  className={classNames(
                    "message-bubble cursor-pointer transition-all duration-200",
                    { "self-message ml-auto": isMe },
                    { "scale-110": copied }
                  )}
                >
                  <h1
                    className={`break-words max-w-full cursor-pointer transition-all duration-200 ${
                      copied ? "scale-110 opacity-60" : ""
                    }`}
                    onClick={handleCopyText}
                  >
                    {message.content}
                  </h1>
                  <MessageReactionDisplay
                    reactions={reactions}
                    isMe={isMe}
                    currentUserId={currentUserId}
                    messageId={message.id}
                    chatId={message.chatId}
                  />
                </div>
              );
          }
        })()}

        {/* Sender Info */}
        {showInfo && isGroupChat && !isMe && (
          <h1 className="text-sm font-semibold opacity-70 mr-2">
            {message.sender.displayName}
          </h1>
        )}

        {/* Time */}
        {!isRecent && (
          <p
            className={`text-xs opacity-40 py-1 ${
              isMe ? "ml-auto" : "mr-auto"
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        )}

        {/* Read Receipts */}
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
                  name={message.sender.displayName}
                  size="5"
                  id={index}
                />
              </div>
            ))}
          </div>
        )}
        {isFocus && <MessageActions message={message} isMe={isMe} />}
      </div>
    </motion.div>
  );
};

export default Message;
