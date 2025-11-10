// components/ui/messages/ChannelMessageBubbleWrapper.tsx
import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { getMessageSendingAnimation } from "@/common/animations/messageAnimations";

interface ChannelMessageBubbleWrapperProps {
  message: MessageResponse;
  isImportant?: boolean;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const ChannelMessageBubbleWrapper: React.FC<
  ChannelMessageBubbleWrapperProps
> = ({ message, isImportant, onDoubleClick, onContextMenu, children }) => {
  const isSending = message.status === MessageStatus.SENDING;

  return (
    <motion.div
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={clsx(
        "rounded-xl overflow-hidden",
        isImportant || message.isImportant
          ? "border-4 border-red-500/80"
          : "custom-border"
      )}
      {...getMessageSendingAnimation(isSending)}
    >
      {children}
    </motion.div>
  );
};

export default ChannelMessageBubbleWrapper;
