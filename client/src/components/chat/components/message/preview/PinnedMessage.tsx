import * as React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useIsMe } from "@/stores/authStore";
import { formatSmartDate } from "@/common/utils/format/formatDateTime";
import { scrollToMessageById } from "@/common/utils/message/scrollToMessageById";
import type { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageHorizontalPreview } from "./MessageHorizontalPreview";
import { messageAnimations } from "@/common/animations/messageAnimations";
import { MessageHorizontalPreviewTypes } from "@/common/enums/MessageHorizontalPreviewTypes";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const isMe = useIsMe(message.sender.id);
  const animationProps = shouldAnimate ? messageAnimations.pinMessage : {};

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        scrollToMessageById(message.id, { smooth: false });
      }}
      className={clsx(
        "relative w-full flex gap-2 py-1 pl-1 items-center cursor-pointer custom-border",
        isMe
          ? "bg-[linear-gradient(to_right,var(--primary-green-50)_0%,var(--primary-green)_50%,var(--primary-green-50)_100%)]"
          : "bg-[linear-gradient(to_right,var(--message-color-50)_0%,var(--message-color)_50%,var(--message-color-50)_100%)]"
      )}
      {...animationProps}
    >
      <button
        className={clsx(
          "group shrink-0 p-1 rounded-full! -rotate-30",
          " bg-red-500 hover:bg-red-700 text-white",
          "border-2 border-white/40"
        )}
        onClick={(e) => {
          e.stopPropagation();
          chatWebSocketService.togglePinMessage({
            chatId: message.chatId,
            messageId: null,
          });
        }}
        style={{ zIndex: 99 }}
      >
        <span className="material-symbols-outlined filled block! group-hover:hidden!">
          keep
        </span>
        <span className="material-symbols-outlined filled hidden! group-hover:block!">
          keep_off
        </span>
      </button>

      <MessageHorizontalPreview
        message={message}
        chatType={chatType}
        type={MessageHorizontalPreviewTypes.PIN}
      />

      <div
        className={clsx(
          "absolute right-0 top-1/2 -translate-y-1/2",
          "h-full flex items-center p-2 pl-32",
          "text-sm italic hover:font-semibold whitespace-nowrap",
          "bg-linear-to-r from-transparent",
          isMe ? "to-(--primary-green)" : "to-(--message-color)"
        )}
        style={{ zIndex: 98 }}
      >
        {message.pinnedAt
          ? formatSmartDate(message.pinnedAt)
          : t("message.sentAt", {
              date: formatSmartDate(message.createdAt),
            })}
      </div>
    </motion.div>
  );
};

export default PinnedMessage;
