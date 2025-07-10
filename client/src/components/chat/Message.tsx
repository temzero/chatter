import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
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
import { messageAnimations } from "@/animations/messageAnimations";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";
import { MessageStatus } from "@/types/enums/message";
import { BeatLoader } from "react-spinners";

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
      className={clsx(
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
  const isFocus = useIsMessageFocus(message.id);
  console.log("isFocus", isFocus);

  const repliedMessage = message.replyToMessage;
  const forwardedMessage = message.forwardedFromMessage;

  const openMessageModal = useModalStore((state) => state.openMessageModal);
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

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

  // const handleClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   closeModal();
  // };

  return (
    <motion.div
      id={`message-${message.id}`}
      ref={messageRef}
      className={clsx("flex max-w-[60%] group relative", {
        "ml-auto": isMe,
        "mr-auto": !isMe,
        "pb-1": isRecent,
        "pb-2": !isRecent,
        "z-[99]": isFocus,
      })}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      // onClick={handleClick}
      onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
      onContextMenu={(e) => {
        e.preventDefault();
        openMessageModal(message.id);
      }}
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

      <div className="flex flex-col w-full">
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
            <div
              className={clsx("message-bubble", {
                "self-message ml-auto": isMe,
                "scale-110": copied,
                "message-bubble-reply": isRelyToThisMessage,
                "opacity-60": message.status === MessageStatus.SENDING,
                "opacity-60 border-2 border-red-500":
                  message.status === MessageStatus.FAILED,
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
              // reactions={reactions}
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
                />
                <MessageActions message={message} isMe={isMe} />
              </>
            )}
          </div>
        </div>

        {showInfo && isGroupChat && !isMe && (
          <h1 className={clsx("text-sm font-semibold opacity-70 mr-2")}>
            {message.sender.displayName}
          </h1>
        )}

        {!isRecent && message.status !== MessageStatus.SENDING && message.status !== MessageStatus.FAILED && (
          <p
            className={clsx("text-xs py-1 opacity-40", {
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

        {readUserAvatars && (
          <div
            className={clsx("flex items-center", {
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
