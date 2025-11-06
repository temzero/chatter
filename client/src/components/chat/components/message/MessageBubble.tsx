import React from "react";
import clsx from "clsx";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import ForwardedMessagePreview from "@/components/ui/messages/ForwardMessagePreview";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { motion } from "framer-motion";
import { getMessageSendingAnimation } from "@/common/animations/messageAnimations";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";

interface MessageBubbleProps {
  message: MessageResponse;
  isMe: boolean;
  isRelyToThisMessage?: boolean;
  currentUserId?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  isRelyToThisMessage,
  currentUserId,
}) => {
  const isForwardMessage = message.forwardedFromMessage;
  const isSending = message.status === MessageStatus.SENDING;
  const isFailed = message.status === MessageStatus.FAILED;
  const attachments = getMessageAttachments(message.chatId, message.id);

  const attachmentLength = attachments.length;

  return (
    <motion.div
      className={clsx("message-bubble opacity-100 object-cover", {
        "border-4 border-red-500/80": message.isImportant,
        "self-message ml-auto": isMe,
        "message-bubble-reply": isRelyToThisMessage,
        "opacity-60 border-2 border-red-500": isFailed,
        "opacity-100": !message.status || message.status === MessageStatus.SENT,
        "w-[70%]": attachmentLength === 1
      })}
      {...getMessageSendingAnimation(isSending)}
    >
      {/* Attachments */}
      <RenderMultipleAttachments
        chatId={message.chatId}
        messageId={message.id}
        attachments={attachments}
        className={clsx({
          // "w-[60%] h-[60%]": attachmentLength === 1
        })}
      />

      {/* Text Content */}
      {message.content && !isForwardMessage && (
        <p className="break-words max-w-full cursor-pointer transition-all duration-200 shadow-xl rounded-b-xl">
          {message.content}
        </p>
      )}

      {/* Forwarded Message */}
      {isForwardMessage && (
        <ForwardedMessagePreview
          message={message}
          originalSender={message.forwardedFromMessage?.sender}
          currentUserId={currentUserId}
          isMe={isMe}
        />
      )}
    </motion.div>
  );
};

export default MessageBubble;
