// components/modals/DeleteMessageModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { useCurrentUserId } from "@/stores/authStore";
import { motion } from "framer-motion";
import { modalAnimations } from "@/animations/modalAnimations";
import { useMessageStore } from "@/stores/messageStore";
import { audioService, SoundType } from "@/services/audio.service";

import { useTranslation } from "react-i18next";

const DeleteMessageModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const messageId = modalContent?.props?.messageId as string;

  const currentUserId = useCurrentUserId();
  const message = useMessageStore.getState().getMessageById(messageId);
  if (!message) return;
  const isMe = message.sender.id === currentUserId;

  const handleDelete = (isDeleteForEveryone: boolean = false) => {
    chatWebSocketService.deleteMessage({
      chatId: message.chatId,
      messageId: message.id,
      isDeleteForEveryone,
    });
    audioService.playSound(SoundType.BREAK);
    closeModal();
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border"
      style={{ zIndex: 100 }}
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-3">
          <span className="material-symbols-outlined text-3xl">chat_error</span>
          <h1 className="text-2xl font-semibold">
            {t("modal.delete_message.title")}
          </h1>
        </div>
        <p className="mb-6 text-sm text-gray-400">
          {t("modal.delete_message.description")}
        </p>
        {/* <MessagePreview message={message} /> */}
      </div>
      <div className="flex custom-border-t">
        <button
          className="p-3 text-yellow-500 opacity-80 hover:opacity-100 font-semibold flex-1"
          onClick={() => handleDelete(false)}
        >
          {t("modal.delete_message.delete_for_me")}
        </button>
        {isMe && (
          <button
            className="p-3 text-red-500 opacity-80 hover:opacity-100 font-semibold flex-1"
            onClick={() => handleDelete(true)}
          >
            {t("modal.delete_message.delete_for_everyone")}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DeleteMessageModal;
