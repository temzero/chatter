import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useTranslation } from "react-i18next";
import { handleError } from "@/common/utils/error/handleError";
import { toast } from "react-toastify";
import ConfirmDialog from "./layout/ConfirmDialog";

interface LeaveChatModalData {
  chat: ChatResponse;
}

const LeaveChatModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const leaveChat = useChatStore.getState().leaveChat;
  const data = getModalData() as unknown as LeaveChatModalData;

  const chat = data?.chat;
  if (!chat) return null;

  const isDirectChat = chat.type === ChatType.DIRECT;
  const capitalizedChatType =
    chat.type.charAt(0).toUpperCase() + chat.type.slice(1);

  const handleLeaveChat = async () => {
    try {
      const isDeleted = await leaveChat(chat.id);
      closeModal();
      if (isDeleted) {
        toast.info(t("modal.leave_chat.chat_deleted"));
      } else {
        toast.info(t("modal.leave_chat.left"));
      }
    } catch (error) {
      handleError(error, "Failed to leave chat");
    }
  };

  const getTitle = () => {
    if (isDirectChat) {
      return t("modal.leave_chat.title_direct");
    }
    return t("modal.leave_chat.title_group", {
      type: capitalizedChatType,
    });
  };

  const getDescription = () => {
    if (isDirectChat) {
      return t("modal.leave_chat.description_direct");
    }
    return t("modal.leave_chat.description_group", { type: chat.type });
  };

  const leaveIcon = (
    <span className="material-symbols-outlined text-4xl! font-bold">
      logout
    </span>
  );

  const chatInfo = (
    <div className="flex items-center gap-2">
      <ChatAvatar chat={chat} />
      <h3 className="font-semibold text-2xl">{chat.name}</h3>
    </div>
  );

  return (
    <ConfirmDialog
      title={getTitle()}
      description={getDescription()}
      icon={leaveIcon}
      confirmText={t("common.actions.leave")}
      onYellowAction={handleLeaveChat}
      onCancel={closeModal}
    >
      {chatInfo}
    </ConfirmDialog>
  );
};

export default LeaveChatModal;
