import React from "react";
import { motion } from "framer-motion";
import { useIsMe } from "@/stores/authStore";
import { formatDateTime } from "@/utils/formatDate";
import { scrollToMessageById } from "@/utils/scrollToMessageById";
import type { MessageResponse } from "@/types/responses/message.response";
import { ChatType } from "@/types/enums/ChatType";
import { MessageHorizontalPreview } from "./MessageHorizontalPreview";

const pinMessageAnimation = {
  initial: { opacity: 0, scale: 1.1, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { type: "spring", stiffness: 300, damping: 29 },
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
  onUnpin?: () => void;
}

const PinnedMessage: React.FC<MessageProps> = ({
  message,
  chatType = ChatType.DIRECT,
  shouldAnimate = false,
  onUnpin,
}) => {
  const isMe = useIsMe(message.sender.id);
  const animationProps = shouldAnimate ? pinMessageAnimation : noAnimation;
  console.log('pinnedMessage', message)

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        scrollToMessageById(message.id, { smooth: false });
      }}
      className={`absolute custom-border w-full top-[var(--header-height)] left-1/2 -translate-x-1/2 flex gap-4 p-1 px-2 items-center justify-between
          ${
            isMe
              ? "bg-[linear-gradient(to_right,var(--primary-green-50)_0%,var(--primary-green)_50%,var(--primary-green-50)_100%)]"
              : "bg-[linear-gradient(to_right,var(--message-color-50)_0%,var(--message-color)_50%,var(--message-color-50)_100%)]"
          }
        `}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
    >
      <button
        className={`group custom-border hover:bg-red-500 p-1 rounded-full -rotate-[30deg]
            ${isMe ? "bg-[var(--primary-green)]" : "bg-[var(--message-color)]"}
          `}
        onClick={(e) => {
          e.stopPropagation();
          onUnpin?.();
        }}
      >
        <span className="material-symbols-outlined block group-hover:hidden">
          keep
        </span>
        <span className="material-symbols-outlined hidden group-hover:block">
          keep_off
        </span>
      </button>

      <MessageHorizontalPreview message={message} chatType={chatType} />

      <p className="text-sm font-light italic">
        {message.pinnedAt
          ? `${formatDateTime(message.pinnedAt)}`
          : `Sent at ${formatDateTime(message.createdAt)}`}
      </p>
    </motion.div>
  );
};

export default PinnedMessage;
