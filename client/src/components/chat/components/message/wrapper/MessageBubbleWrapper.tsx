// components/ui/messages/MessageBubbleWrapper.tsx
import * as React from "react";
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
        "self-message ml-auto": isMe,
          "border-6 rounded-xl! border-yellow-400": message.isImportant,
          "message-bubble-reply": isRelyToThisMessage,
          "opacity-60 border-2 border-red-500": isFailed,
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
