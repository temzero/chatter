// components/modals/DeleteMessageModal.tsx
import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { getCurrentUserId } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { handleError } from "@/common/utils/error/handleError";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { useTranslation } from "react-i18next";
import { getChatTypeById } from "@/stores/chatStore";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import ConfirmDialog from "./layout/ConfirmDialog";

interface DeleteMessageModalData {
  messageId: string;
}

const DeleteMessageModal: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return null;

  const closeModal = getCloseModal();
  const data = getModalData() as unknown as DeleteMessageModalData;

  const getMessageById = useMessageStore.getState().getMessageById;
  const message = data?.messageId ? getMessageById(data.messageId) : undefined;

  if (!message) return null;

  const chatId = message.chatId;
  const chatType = getChatTypeById(chatId);
  const isDirectChat = chatType === ChatType.DIRECT;
  const isSender = message.sender.id === currentUserId;

  const myMember = useChatMemberStore
    .getState()
    .getChatMemberByUserIdAndChatId(chatId, currentUserId);

  const isOwnerOrAdmin =
    myMember?.role === ChatMemberRole.ADMIN ||
    myMember?.role === ChatMemberRole.OWNER;

  const isHardDelete = isDirectChat ? isSender : isSender || isOwnerOrAdmin;

  const handleDelete = async (isDeleteForEveryone: boolean) => {
    try {
      chatWebSocketService.deleteMessage({
        messageId: message.id,
        chatId,
        isDeleteForEveryone,
      });
      closeModal();
    } catch (error) {
      handleError(error, "Delete Message failed");
    }
  };

  return (
    <ConfirmDialog
      title={t("modal.delete_message.title")}
      description={t("modal.delete_message.description")}
      icon={
        <span className="material-symbols-outlined text-3xl!">chat_error</span>
      }
      confirmText={
        isHardDelete
          ? t("common.actions.delete")
          : t("modal.delete_message.delete_for_me")
      }
      onRedAction={
        isHardDelete
          ? () => handleDelete(true) // 🔴 delete for everyone
          : undefined
      }
      onYellowAction={
        !isHardDelete
          ? () => handleDelete(false) // 🟡 delete for me
          : undefined
      }
      disableCancel={false}
    />
  );
};

export default DeleteMessageModal;
