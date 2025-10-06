import React from "react";
import clsx from "clsx";
import { MessageResponse } from "@/types/responses/message.response";
import {
  ModalType,
  useModalStore,
  useSetReplyToMessageId,
} from "@/stores/modalStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { scrollToMessageById } from "@/utils/scrollToMessageById";
import { useTranslation } from "react-i18next";

interface MessageActionsProps {
  message: MessageResponse;
  className?: string;
  isMe?: boolean;
  isSystemMessage?: boolean;
  isChannel?: boolean;
  onClose?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  className = "",
  isMe = false,
  isChannel = false,
  isSystemMessage = false,
  onClose,
}) => {
  const { t } = useTranslation();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const setReplyToMessageId = useSetReplyToMessageId();
  const isPinned = false;
  const isAlreadyReply = !!message.replyToMessageId;

  // 🔹 Helper to stop repeat code
  const actions = {
    reply: {
      icon: "reply",
      label: t("common.actions.reply"),
      action: () => {
        setReplyToMessageId(message.id);
        scrollToMessageById(message.id, { animate: false });
      },
    },
    forward: {
      icon: "arrow_warm_up",
      label: t("common.actions.forward"),
      action: () => {
        if (onClose) onClose();
        openModal(ModalType.FORWARD_MESSAGE, { message });
      },
    },
    pin: {
      icon: isPinned ? "remove" : "keep",
      label: isPinned ? t("common.actions.unpin") : t("common.actions.pin"),
      action: () => {
        chatWebSocketService.togglePinMessage({
          chatId: message.chatId,
          messageId: isPinned ? null : message.id,
        });
        if (onClose) onClose();
        closeModal();
      },
    },
    save: {
      icon: "bookmark",
      label: t("common.actions.save"),
      action: () => {
        if (onClose) onClose();
        chatWebSocketService.saveMessage({ messageId: message.id });
        closeModal();
      },
    },
    important: {
      icon: "star",
      label: message.isImportant
        ? t("common.actions.unmark_important")
        : t("common.actions.mark_important"),
      action: () => {
        if (onClose) onClose();
        chatWebSocketService.toggleImportantMessage({
          messageId: message.id,
          chatId: message.chatId,
          isImportant: !message.isImportant,
        });
        closeModal();
      },
    },
    delete: {
      icon: "delete",
      label: t("common.actions.delete"),
      action: () => {
        if (onClose) onClose();
        openModal(ModalType.DELETE_MESSAGE, { messageId: message.id });
      },
    },
  };

  // 🔹 Build the list dynamically
  let baseActions: (typeof actions)[keyof typeof actions][] = [];

  if (isChannel) {
    baseActions = isMe
      ? [
          ...(!isAlreadyReply ? [actions.reply] : []),
          actions.forward,
          actions.pin,
          actions.save,
          actions.important,
          actions.delete,
        ]
      : [actions.forward, actions.save, actions.delete];
  } else if (isSystemMessage) {
    baseActions = [actions.reply, actions.delete];
  } else {
    baseActions = [
      ...(!isAlreadyReply ? [actions.reply] : []),
      actions.forward,
      actions.pin,
      actions.save,
      actions.important,
      actions.delete,
    ];
  }

  return (
    <div
      className={clsx("flex rounded-lg blur-card z-50", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {baseActions.map((action, index) => (
        <button
          key={index}
          className={clsx(
            "py-2 px-3 flex flex-col items-center justify-center rounded-lg",
            "hover:bg-black/40 hover:scale-110 transition-all"
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
              action.label === t("common.actions.reply") && "rotate-180",
              action.label === t("common.actions.forward") && "rotate-90",
              action.label === t("common.actions.delete") && "text-red-400",
              action.label.includes("Important") &&
                message.isImportant &&
                "filled text-red-500 font-bold"
            )}
          >
            {action.icon}
          </i>
        </button>
      ))}
    </div>
  );
};
