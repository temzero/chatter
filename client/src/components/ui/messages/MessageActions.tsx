import * as React from "react";
import clsx from "clsx";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { ModalType } from "@/common/enums/modalType";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { scrollToMessageById } from "@/common/utils/message/scrollToMessageById";
import { useTranslation } from "react-i18next";
import { audioService, SoundType } from "@/services/audioService";
import {
  getCloseModal,
  getOpenModal,
  setOpenReplyToMessageModal,
} from "@/stores/modalStore";

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
  const openModal = getOpenModal();
  const closeModal = getCloseModal();

  const isAlreadyReply = !!message.replyToMessageId;
  const isPinned = message.isPinned;
  const isImportant = message.isImportant;
  // 🔹 Helper to stop repeat code
  const actions = {
    reply: {
      icon: "reply",
      label: t("common.actions.reply"),
      class: "rotate-180",
      action: () => {
        setOpenReplyToMessageModal(message.id);
        scrollToMessageById(message.id, { animate: false });
      },
    },
    forward: {
      icon: "arrow_warm_up",
      label: t("common.actions.forward"),
      class: "rotate-90",
      action: () => {
        if (onClose) onClose();
        openModal(ModalType.FORWARD_MESSAGE, { message });
      },
    },
    save: {
      icon: "bookmark",
      label: t("common.actions.save"),
      class: "",
      action: () => {
        if (onClose) onClose();
        chatWebSocketService.saveMessage({ messageId: message.id });
        closeModal();
      },
    },
    pin: {
      icon: isPinned ? "keep_off" : "keep",
      label: isPinned ? t("common.actions.unpin") : t("common.actions.pin"),
      class: isPinned && "filled",
      action: () => {
        chatWebSocketService.togglePinMessage({
          chatId: message.chatId,
          messageId: isPinned ? null : message.id,
        });
        if (onClose) onClose();
        closeModal();
        audioService.playSound(SoundType.PIN);
      },
    },

    important: {
      icon: "star",
      label: isImportant
        ? t("common.actions.unmark_important")
        : t("common.actions.mark_important"),
      class: isImportant && "filled text-red-400",
      action: () => {
        if (onClose) onClose();
        chatWebSocketService.toggleImportantMessage({
          messageId: message.id,
          chatId: message.chatId,
          isImportant: !isImportant,
        });
        closeModal();
      },
    },
    delete: {
      icon: "delete",
      label: t("common.actions.delete"),
      class: "text-red-400",
      action: () => {
        if (onClose) onClose();
        openModal(ModalType.DELETE_MESSAGE, {
          messageId: message.id,
        });
      },
    },
  };

  // 🔹 Build the list dynamically
  let baseActions: (typeof actions)[keyof typeof actions][] = [];

  if (isSystemMessage) {
    baseActions = [actions.reply, actions.important, actions.delete];
  } else if (isChannel) {
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
      onClick={(e) => e.stopPropagation()}
      className={clsx(
        "flex justify-end rounded-lg bg-(--sidebar-color) custom-border overflow-hidden",
        className
      )}
      style={{ zIndex: 99 }}
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
            closeModal();
            action.action();
          }}
          title={action.label}
        >
          <i
            className={clsx("material-symbols-outlined text-2xl!", action.class)}
          >
            {action.icon}
          </i>
        </button>
      ))}
    </div>
  );
};
