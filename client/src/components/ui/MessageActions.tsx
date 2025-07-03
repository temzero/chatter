// components/ui/MessageActions.tsx
import React from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { MessageResponse } from "@/types/responses/message.response";
import { useMessageStore } from "@/stores/messageStore";
import { ModalType, useModalStore } from "@/stores/modalStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";

interface MessageActionsProps {
  message: MessageResponse;
  className?: string;
  isMe?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  className = "",
  isMe,
}) => {
  const setReplyToMessage = useMessageStore((state) => state.setReplyToMessage);
  const { openModal, closeModal } = useModalStore(); // Use hook properly
  const isPinned = false;
  const isAlreadyReply = !!message.replyToMessageId;

  const baseActions = [
    ...(!isAlreadyReply
      ? [
          {
            icon: "reply",
            label: "Reply",
            action: () => {
              setReplyToMessage(message);
            },
          },
        ]
      : []),
    {
      icon: "arrow_warm_up",
      label: "Forward",
      action: () => {
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
      },
    },
    {
      icon: "bookmark",
      label: "Save",
      action: () => {
        chatWebSocketService.saveMessage({ messageId: message.id });
      },
    },
    {
      icon: "delete",
      label: "Delete",
      action: () => {
        openModal(ModalType.DELETE_MESSAGE, { message });
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
      className={classNames(
        "absolute -bottom-[50px] flex bg-[var(--sidebar-color)] custom-border rounded-lg shadow-lg z-50",
        {
          "right-0": isMe,
          "left-0": !isMe,
        },
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {baseActions.map((action, index) => (
        <button
          key={index}
          className={classNames(
            "py-2 px-3 flex flex-col items-center justify-center opacity-70",
            "hover:opacity-100 hover:bg-[--hover-color]"
          )}
          onClick={(e) => {
            e.stopPropagation();
            closeModal();
            action.action();
          }}
          title={action.label}
        >
          <i
            className={classNames(
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
