// components/modals/DeleteMessageModal.tsx
import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { getCurrentUserId } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { handleError } from "@/common/utils/error/handleError";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import Button from "../ui/buttons/Button";
import { useTranslation } from "react-i18next";

interface DeleteMessageModalData {
  messageId: string;
}

const DeleteMessageModal: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    return;
  }
  const closeModal = getCloseModal();
  const data = getModalData() as unknown as DeleteMessageModalData | undefined;

  const getMessageById = useMessageStore.getState().getMessageById;
  const messageId = data?.messageId;
  const message = messageId ? getMessageById(messageId) : undefined;
  const chatId = message?.chatId ?? "";

  if (!message) return null;
  const isSender = message.sender.id === currentUserId;

  const myMember = useChatMemberStore
    .getState()
    .getChatMemberByUserIdAndChatId(chatId, currentUserId);

  const isOwnerOrAdmin =
    myMember?.role === ChatMemberRole.ADMIN ||
    myMember?.role === ChatMemberRole.OWNER;

  console.log("isSender", isSender);
  console.log("isOwnerOrAdmin", isOwnerOrAdmin);

  const canDeleteForEveryone = isSender || isOwnerOrAdmin;

  const handleDelete = async (isDeleteForEveryone: boolean = false) => {
    try {
      chatWebSocketService.deleteMessage({
        messageId: message.id,
        chatId: chatId,
        isDeleteForEveryone,
      });
      closeModal();
    } catch (error) {
      handleError(error, "Delete Message failed");
    }
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
      </div>

      <div className="flex custom-border-t">
        {!canDeleteForEveryone && (
          <Button
            variant="ghost"
            fullWidth
            onClick={() => handleDelete(false)}
            className="text-yellow-500"
          >
            {t("modal.delete_message.delete_for_me")}
          </Button>
        )}
        {canDeleteForEveryone && (
          <Button
            variant="ghost"
            fullWidth
            onClick={() => handleDelete(true)}
            className="text-red-500"
          >
            {t("common.actions.delete")}
          </Button>
        )}
      </div>
    </>
  );
};

export default DeleteMessageModal;
