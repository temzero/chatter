import React from "react";
import { motion } from "framer-motion";
import { useIsMe } from "@/stores/authStore";
import { formatDateTime } from "@/common/utils/format/formatDateTime";
import { scrollToMessageById } from "@/common/utils/message/scrollToMessageById";
import type { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageHorizontalPreview } from "./MessageHorizontalPreview";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { MessageHorizontalPreviewTypes } from "@/common/enums/MessageHorizontalPreviewTypes";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";

interface MessageProps {
  message: MessageResponse;
  chatType?: ChatType;
  shouldAnimate?: boolean;
}

const PinnedMessage: React.FC<MessageProps> = ({
  message,
  chatType = ChatType.DIRECT,
  shouldAnimate = false,
}) => {
  const isMe = useIsMe(message.sender.id);
  const animationProps = shouldAnimate ? messageAnimations.pinMessage : {};

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        scrollToMessageById(message.id, { smooth: false });
      }}
      className={`absolute custom-border w-full h-[--pinned-message-height] top-[var(--header-height)] left-1/2 -translate-x-1/2 flex gap-4 p-1 px-2 items-center justify-between cursor-pointer
          ${
            isMe
              ? "bg-[linear-gradient(to_right,var(--primary-green-50)_0%,var(--primary-green)_50%,var(--primary-green-50)_100%)]"
              : "bg-[linear-gradient(to_right,var(--message-color-50)_0%,var(--message-color)_50%,var(--message-color-50)_100%)]"
          }
        `}
      {...animationProps}
    >
      <button
        className={`group custom-border hover:bg-red-500 p-1 rounded-full -rotate-[30deg]
            ${isMe ? "bg-[var(--primary-green)]" : "bg-[var(--message-color)]"}
          `}
        onClick={(e) => {
          e.stopPropagation();
          chatWebSocketService.togglePinMessage({
            chatId: message.chatId,
            messageId: null,
          });
        }}
      >
        <span className="material-symbols-outlined filled block group-hover:hidden">
          keep
        </span>
        <span className="material-symbols-outlined filled hidden group-hover:block">
          keep_off
        </span>
      </button>

      <div className="max-w-[80%]">
        <MessageHorizontalPreview
          message={message}
          chatType={chatType}
          type={MessageHorizontalPreviewTypes.PIN}
        />
      </div>

      <p className="text-sm font-light italic truncate">
        {message.pinnedAt
          ? `${formatDateTime(message.pinnedAt)}`
          : `Sent at ${formatDateTime(message.createdAt)}`}
      </p>
    </motion.div>
  );
};

export default PinnedMessage;
