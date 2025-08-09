import React, { useState, useRef } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useCurrentUserId } from "@/stores/authStore";
import RenderMultipleAttachments from "../ui/RenderMultipleAttachments";
import { formatTime } from "@/utils/formatTime";
import { Avatar } from "../ui/avatar/Avatar";
import { ChatType } from "@/types/enums/ChatType";
import { MessageReactionDisplay } from "../ui/MessageReactionsDisplay";
import MessageReplyPreview from "../ui/MessageReplyPreview";
import ForwardedMessagePreview from "../ui/ForwardMessagePreview";
import { handleQuickReaction } from "@/utils/quickReaction";
import { messageAnimations } from "@/animations/messageAnimations";
import { MessageStatus } from "@/types/enums/message";
import { BeatLoader } from "react-spinners";
import { SystemMessageJSONContent } from "../ui/SystemMessageContent";
import SystemMessage from "./SystemMessage";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";
import { MessageContextMenu } from "./MessageContextMenu";
import type { MessageResponse } from "@/types/responses/message.response";

interface MessageProps {
  message: MessageResponse;
  chatType?: ChatType;
  showInfo?: boolean;
  isRecent?: boolean;
  isRead?: boolean;
  readUserAvatars?: string[];
}

const Message: React.FC<MessageProps> = ({
  message,
  chatType = ChatType.DIRECT,
  showInfo = true,
  isRecent = false,
  readUserAvatars,
}) => {
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const isRelyToThisMessage = useIsReplyToThisMessage(message.id);
  const isFocus = useIsMessageFocus(message.id);

  const repliedMessage = message.replyToMessage;

  const openMessageModal = useModalStore((state) => state.openMessageModal);
  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openMessageModal(message.id);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };

  const animationProps = message.shouldAnimate
    ? isMe
      ? messageAnimations.myMessage
      : messageAnimations.otherMessage
    : messageAnimations.none;

  const isGroupChat = chatType === "group";
  const attachments = message.attachments || [];

  // Check if the message is a system message
  const isSystemMessage = !!message.systemEvent;

  if (isSystemMessage) {
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
      id={`message-${message.id}`}
      ref={messageRef}
      className={clsx("flex max-w-[60%] group relative ", {
        "ml-auto": isMe,
        "mr-auto": !isMe,
        "pb-1": isRecent,
        "pb-2": !isRecent,
        "z-[99]": isFocus,
      })}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
      onContextMenu={handleContextMenu}
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
                "border-4 border-red-500/80": message.isImportant,
                "self-message ml-auto": isMe,
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
              <RenderMultipleAttachments attachments={attachments} />
              <p className="break-words max-w-full cursor-pointer transition-all duration-200 shadow-xl rounded-b-xl">
                {message.content}
              </p>
              {message.forwardedFromMessage && (
                <ForwardedMessagePreview
                  message={message}
                  originalSender={message.forwardedFromMessage?.sender}
                  currentUserId={currentUserId ?? undefined}
                  isMe={isMe}
                />
              )}
            </div>
            <MessageReactionDisplay
              isMe={isMe}
              currentUserId={currentUserId}
              messageId={message.id}
              chatId={message.chatId}
            />
            {isFocus && !isRelyToThisMessage && (
              <MessageContextMenu
                message={message}
                isMe={isMe}
                isChannel={false}
                position={contextMenuPosition || undefined}
                onClose={closeContextMenu}
              />
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