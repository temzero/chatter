// components/ui/MessageActions.tsx
import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { MessageResponse } from "@/types/responses/message.response";
import {
  ModalType,
  useModalStore,
  useSetReplyToMessageId,
} from "@/stores/modalStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { scrollToMessageById } from "@/utils/scrollToMessageById";

interface MessageActionsProps {
  message: MessageResponse;
  className?: string;
  isMe?: boolean;
  onClose?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  className = "",
  isMe,
  onClose,
}) => {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const setReplyToMessageId = useSetReplyToMessageId();
  const isPinned = false;
  const isAlreadyReply = !!message.replyToMessageId;

  const baseActions = [
    ...(!isAlreadyReply
      ? [
          {
            icon: "reply",
            label: "Reply",
            action: () => {
              setReplyToMessageId(message.id);
              scrollToMessageById(message.id, { animate: false });
            },
          },
        ]
      : []),
    {
      icon: "arrow_warm_up",
      label: "Forward",
      action: () => {
        if (onClose) onClose();
        openModal(ModalType.FORWARD_MESSAGE, { message });
      },
    },
    {
      icon: isPinned ? "remove" : "keep",
      label: isPinned ? "Unpin" : "Pin",
      action: () => {
        chatWebSocketService.togglePinMessage({
          chatId: message.chatId,
          messageId: isPinned ? null : message.id,
        });
        if (onClose) onClose();
        closeModal();
      },
    },
    {
      icon: "bookmark",
      label: "Save",
      action: () => {
        if (onClose) onClose();
        chatWebSocketService.saveMessage({ messageId: message.id });
        closeModal();
      },
    },
    {
      icon: "delete",
      label: "Delete",
      action: () => {
        if (onClose) onClose();
        openModal(ModalType.DELETE_MESSAGE, {
          messageId: message.id,
        });
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      // exit={{ opacity: 0, scale: 0.5, y: -10 }}
      style={{
        transformOrigin: isMe ? "top right" : "top left",
      }}
      className={clsx(
        "absolute -bottom-14 flex rounded-lg blur-card z-50",
        {
          "right-0": isMe,
          "left-0": !isMe,
          // "-bottom-14": !flip, // Default position below
          // "-top-14": flip, // Flipped position above
        },
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {baseActions.map((action, index) => (
        <button
          key={index}
          className={clsx(
            "py-2 px-3 flex flex-col items-center justify-center rounded-lg",
            "hover:bg-black/40 hover:text-green-300 hover:scale-110 transition-all"
          )}
          onClick={(e) => {
            e.stopPropagation();
            action.action();
          }}
          title={action.label}
        >
          <i
            className={clsx(
              "material-symbols-outlined text-2xl",
              action.label === "Reply" && "rotate-180",
              action.label === "Forward" && "rotate-90",
              action.label === "Delete" && "text-red-400"
            )}
          >
            {action.icon}
          </i>
        </button>
      ))}
    </motion.div>
  );
};
