import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import RenderMultipleAttachments from "../ui/RenderMultipleAttachments";
import { formatTime } from "@/utils/formatTime";
import type { MessageResponse } from "@/types/responses/message.response";
import SystemMessage from "./SystemMessage";
import { SystemMessageJSONContent } from "../ui/SystemMessageContent";
import { useCurrentUserId } from "@/stores/authStore";
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
import { ChatType } from "@/types/enums/ChatType";

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
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const attachments = message.attachments ?? [];

  // Copy text handler
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
      <div className="p-1 w-full flex items-center justify-center">
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
      key={message.id}
      ref={messageRef}
      className={clsx("relative group rounded-lg w-[60%] mx-auto", {
        "scale-[1.1]": isReplyToThisMessage,
        "z-[99]": isFocus,
      })}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
      onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
      onContextMenu={(e) => {
        e.preventDefault();
        openMessageModal(message.id);
      }}
    >
      <div className="rounded-xl custom-border overflow-hidden">
        {repliedMessage && (
          <MessageReplyPreview
            replyMessage={repliedMessage}
            chatType={ChatType.CHANNEL}
            isMe={isMe}
            currentUserId={currentUserId ?? ""}
            senderId={message.sender.id}
            isHidden={isFocus}
          />
        )}

        {attachments.length > 0 && (
          <div className="rounded overflow-hidden shadow-lg">
            <RenderMultipleAttachments attachments={attachments} />
          </div>
        )}
        {message.content && (
          <p
            className={clsx("backdrop-blur-sm p-4", {
              "scale-110 opacity-60": copied,
            })}
            onClick={handleCopyText}
          >
            {message.content}
          </p>
        )}
      </div>

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
        <>
          <ReactionPicker
            messageId={message.id}
            chatId={message.chatId}
            isMe={isMe}
            isChannel={true}
          />
          <MessageActions message={message} isMe={isMe} isChannel={true} />
        </>
      )}

      <div className="absolute bottom-1 right-1 text-xs italic opacity-0 group-hover:opacity-80 font-semibold bg-[--sidebar-color] p-0.5 px-1.5 rounded-full z-9 backdrop-blur-lg">
        {formatTime(message.createdAt)}
      </div>

      {message.status === MessageStatus.FAILED && (
        <h1 className="text-red-500 text-sm text-center">
          Failed to send message
        </h1>
      )}
    </motion.div>
  );
};

export default ChannelMessage;
