// components/modals/DeleteMessageModal.tsx
import React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { useCurrentUserId } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { audioService, SoundType } from "@/services/audio.service";

import { useTranslation } from "react-i18next";
import Button from "../ui/buttons/Button";

interface DeleteMessageModalData {
  messageId: string;
}

const DeleteMessageModal: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = useCurrentUserId();
  const closeModal = getCloseModal();
  const data = getModalData() as unknown as DeleteMessageModalData | undefined;

  const getMessageById = useMessageStore.getState().getMessageById;
  const messageId = data?.messageId;
  const message = messageId ? getMessageById(messageId) : undefined;

  if (!message) return null;
  const isMe = message.sender.id === currentUserId;

  const handleDelete = (isDeleteForEveryone: boolean = false) => {
    chatWebSocketService.deleteMessage({
      chatId: message.chatId,
      messageId: message.id,
      isDeleteForEveryone,
    });
    audioService.playSound(SoundType.BREAK, 0.3);
    closeModal();
  };

  return (
    <>
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
        <Button
          variant="ghost"
          fullWidth
          onClick={() => handleDelete(false)}
          className="text-yellow-500"
        >
          {t("modal.delete_message.delete_for_me")}
        </Button>
        {isMe && (
          <Button
            variant="ghost"
            fullWidth
            onClick={() => handleDelete(true)}
            className="text-red-500"
          >
            {t("modal.delete_message.delete_for_everyone")}
          </Button>
        )}
      </div>
    </>
  );
};

export default DeleteMessageModal;
