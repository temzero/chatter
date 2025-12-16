import * as React from "react";
import { motion } from "framer-motion";
import { useIsMe } from "@/stores/authStore";
import { formatDateTime } from "@/common/utils/format/formatDateTime";
import { scrollToMessageById } from "@/common/utils/message/scrollToMessageById";
import type { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageHorizontalPreview } from "./MessageHorizontalPreview";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { MessageHorizontalPreviewTypes } from "@/common/enums/MessageHorizontalPreviewTypes";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";

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
      className={`w-full flex gap-2 p-1 px-2 items-center cursor-pointer custom-border
    ${
      isMe
        ? "bg-[linear-gradient(to_right,var(--primary-green-50)_0%,var(--primary-green)_50%,var(--primary-green-50)_100%)]"
        : "bg-[linear-gradient(to_right,var(--message-color-50)_0%,var(--message-color)_50%,var(--message-color-50)_100%)]"
    }
  `}
      {...animationProps}
    >
      {/* Pin button – fixed */}
      <button
        className={`shrink-0 group custom-border hover:bg-red-500 p-1 rounded-full! -rotate-30
      ${isMe ? "bg-(--primary-green)" : "bg-(--message-color)"}
    `}
        onClick={(e) => {
          e.stopPropagation();
          chatWebSocketService.togglePinMessage({
            chatId: message.chatId,
            messageId: null,
          });
        }}
      >
        <span className="material-symbols-outlined filled block! group-hover:hidden">
          keep
        </span>
        <span className="material-symbols-outlined filled hidden! group-hover:block">
          keep_off
        </span>
      </button>

      {/* Message preview – ONLY this can shrink */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <MessageHorizontalPreview
          message={message}
          chatType={chatType}
          type={MessageHorizontalPreviewTypes.PIN}
        />
      </div>

      {/* Date – fixed */}
      <div className="shrink-0 text-sm text-end font-light italic whitespace-nowrap">
        {message.pinnedAt
          ? formatDateTime(message.pinnedAt)
          : `Sent at ${formatDateTime(message.createdAt)}`}
      </div>
    </motion.div>
  );
};

export default PinnedMessage;
