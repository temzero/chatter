// components/ui/MessageActions.tsx
import React from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { MessageResponse } from "@/types/responses/message.response";
import { useMessageStore } from "@/stores/messageStore";
import { useModalStore } from "@/stores/modalStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";

interface MessageActionsProps {
  message: MessageResponse;
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  className = "",
}) => {
  const setReplyToMessage = useMessageStore((state) => state.setReplyToMessage);
  const { openModal, closeModal } = useModalStore(); // Use hook properly
  const isPinned = false;
  const isAlreadyReply = !!message.replyToMessageId;

  const baseActions = [
    // Only show reply action if this message isn't already a reply
    ...(!isAlreadyReply
      ? [
          {
            icon: "prompt_suggestion",
            label: "Reply",
            action: () => {
              setReplyToMessage(message);
              closeModal();
            },
          },
        ]
      : []),
    {
      icon: "arrow_warm_up",
      label: "Forward",
      action: () => {
        openModal("forward-message", { message });
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
        closeModal();
      },
    },
    {
      icon: "bookmark",
      label: "Save",
      action: () => {
        chatWebSocketService.saveMessage({ messageId: message.id });
        closeModal();
      },
    },
    {
      icon: "delete",
      label: "Delete",
      action: () => {
        openModal("delete-message", { message });
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -10 }}
      className={classNames(
        "flex gap-2 bg-[var(--sidebar-color)] p-1.5 rounded-lg shadow-lg z-[99]",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {baseActions.map((action, index) => (
        <button
          key={index}
          className={classNames(
            "p-1 rounded-full flex flex-col items-center justify-center opacity-70 hover:opacity-100",
            "transition-all duration-200 cursor-pointer"
          )}
          onClick={(e) => {
            e.stopPropagation();
            action.action();
          }}
          title={action.label}
        >
          <i
            className={`material-symbols-outlined text-2xl hover:scale-150 transition-all duration-300 ${
              action.label === "Forward" && "rotate-90"
            }`}
          >
            {action.icon}
          </i>
        </button>
      ))}
    </motion.div>
  );
};
