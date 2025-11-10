// components/ui/messages/MessageBubbleWrapper.tsx
import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { getMessageSendingAnimation } from "@/common/animations/messageAnimations";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";

interface MessageBubbleWrapperProps {
  message: MessageResponse;
  isMe: boolean;
  isRelyToThisMessage?: boolean;
  attachmentLength: number;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const MessageBubbleWrapper: React.FC<MessageBubbleWrapperProps> = ({
  message,
  isMe,
  isRelyToThisMessage,
  attachmentLength,
  children,
  className,
  onClick,
}) => {
  const isSending = message.status === MessageStatus.SENDING;
  const isFailed = message.status === MessageStatus.FAILED;

  return (
    <motion.div
      className={clsx(
        "message-bubble opacity-100 object-cover",
        {
          "border-4 border-red-500/80": message.isImportant,
          "self-message ml-auto": isMe,
          "message-bubble-reply": isRelyToThisMessage,
          "opacity-60 border-2 border-red-500": isFailed,
          "w-[70%]": attachmentLength === 1,
          "cursor-pointer": !!onClick,
        },
        className
      )}
      onClick={onClick}
      {...getMessageSendingAnimation(isSending)}
    >
      {children}
    </motion.div>
  );
};

export default MessageBubbleWrapper;
