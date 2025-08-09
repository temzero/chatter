import React, { useState, useRef } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import RenderMultipleAttachments from "../ui/RenderMultipleAttachments";
import { formatTime } from "@/utils/formatTime";
import type { MessageResponse } from "@/types/responses/message.response";
import SystemMessage from "./SystemMessage";
import { SystemMessageJSONContent } from "../ui/SystemMessageContent";
import { useCurrentUserId } from "@/stores/authStore";
import { MessageReactionDisplay } from "../ui/MessageReactionsDisplay";
import ForwardedMessagePreview from "../ui/ForwardMessagePreview";
import { handleQuickReaction } from "@/utils/quickReaction";
import { messageAnimations } from "@/animations/messageAnimations";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";
import { MessageStatus } from "@/types/enums/message";
import { ChatType } from "@/types/enums/ChatType";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageHorizontalPreview } from "./MessageHorizontalPreview";
import { scrollToMessageById } from "@/utils/scrollToMessageById";
import { MessageHorizontalPreviewTypes } from "@/types/enums/MessageHorizontalPreviewTypes";

interface ChannelMessageProps {
  message: MessageResponse;
}

const ChannelMessage: React.FC<ChannelMessageProps> = ({ message }) => {
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const isReplyToThisMessage = useIsReplyToThisMessage(message.id);
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
    // Open your existing modal
    openMessageModal(message.id);
    // Set position for reaction picker
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };
  const attachments = message.attachments ?? [];

  // Animation
  const animationProps = message.shouldAnimate
    ? isMe
      ? messageAnimations.myMessage
      : messageAnimations.otherMessage
    : messageAnimations.none;

  // Check system message
  const isSystemMessage = !!message.systemEvent;
  if (isSystemMessage) {
    return (
      <SystemMessage
        message={message}
        systemEvent={message.systemEvent}
        senderId={message.sender.id}
        senderDisplayName={message.sender.displayName}
        content={message.content as SystemMessageJSONContent}
      />
    );
  }

  return (
    <motion.div
      key={message.id}
      ref={messageRef}
      id={`message-${message.id}`}
      className={clsx("relative w-[60%] group mx-auto mb-4", {
        "scale-[1.1]": isReplyToThisMessage,
        "z-[99]": isFocus,
      })}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
    >
      {repliedMessage && (
        <div
          onClick={() => scrollToMessageById(repliedMessage.id)}
          className="w-[90%] mx-auto bg-[--sidebar-color] text-xs rounded-t-xl cursor-pointer p-2 pb-0 opacity-80 hover:opacity-100 custom-border"
        >
          <MessageHorizontalPreview
            message={repliedMessage}
            chatType={ChatType.CHANNEL}
            type={MessageHorizontalPreviewTypes.REPLY_CHANNEL_MESSAGE}
          />
        </div>
      )}
      <div
        onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
        onContextMenu={handleContextMenu}
        className={`rounded-xl overflow-hidden ${
          message.isImportant ? "border-4 border-red-500/80" : "custom-border"
        }`}
      >
        {attachments.length > 0 && (
          <div className="rounded overflow-hidden shadow-lg">
            <RenderMultipleAttachments attachments={attachments} />
          </div>
        )}
        {message.content && (
          <p className={clsx("backdrop-blur p-4")}>{message.content}</p>
        )}

        {message.forwardedFromMessage && (
          <ForwardedMessagePreview
            message={message}
            originalSender={message.forwardedFromMessage?.sender}
            currentUserId={currentUserId ?? undefined}
            isMe={isMe}
          />
        )}

        <MessageReactionDisplay
          isChannel={true}
          currentUserId={currentUserId}
          messageId={message.id}
          chatId={message.chatId}
        />

        {isFocus && !isReplyToThisMessage && (
          <MessageContextMenu
            message={message}
            isMe={isMe}
            isChannel={true}
            position={contextMenuPosition || undefined}
            onClose={closeContextMenu}
          />
        )}

        <div className="absolute bottom-1 right-1 text-xs italic opacity-0 group-hover:opacity-80 font-semibold bg-[--sidebar-color] p-0.5 px-1.5 rounded-full z-9 backdrop-blur-lg">
          {formatTime(message.createdAt)}
        </div>

        {message.status === MessageStatus.FAILED && (
          <h1 className="text-red-500 text-sm text-center">
            Failed to send message
          </h1>
        )}
      </div>
    </motion.div>
  );
};

export default ChannelMessage;
