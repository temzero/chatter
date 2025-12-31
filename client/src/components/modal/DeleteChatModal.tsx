import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";
import { handleError } from "@/common/utils/error/handleError";
import { toast } from "react-toastify";
import ConfirmDialog from "./layout/ConfirmDialog";

interface DeleteChatModalData {
  chat: ChatResponse;
}

const DeleteChatModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const deleteChat = useChatStore.getState().deleteChat;
  const setSidebarInfo = getSetSidebarInfo();
  const data = getModalData() as unknown as DeleteChatModalData | undefined;

  const chat = data?.chat;
  if (!chat) return null;

  const isDirectChat = chat.type === ChatType.DIRECT;
  const capitalizedChatType = chat.type.charAt(0).toUpperCase() + chat.type.slice(1);

  const handleDeleteChat = async () => {
    try {
      closeModal();
      setSidebarInfo(SidebarInfoMode.DEFAULT);
      await deleteChat(chat.id);

      // Pick correct translation key based on chat type
      let toastKey = "toast.chat.deleted"; // default
      if (chat.type === ChatType.GROUP) {
        toastKey = "toast.chat.group_deleted";
      } else if (chat.type === ChatType.CHANNEL) {
        toastKey = "toast.chat.channel_deleted";
      }
      toast.success(t(toastKey, { name: chat.name }));
    } catch (error) {
      handleError(error, "Delete chat failed");
    }
  };

  const getTitle = () => {
    if (isDirectChat) {
      return t("modal.delete_chat.title_direct");
    }
    return t("modal.delete_chat.title_group", {
      type: capitalizedChatType,
    });
  };

  const getDescription = () => {
    return t("modal.delete_chat.description_group", {
      type: chat.type.toLowerCase(),
    });
  };

  const deleteIcon = (
    <span className="material-symbols-outlined text-3xl! font-bold text-red-500">
      delete
    </span>
  );

  const chatInfo = (
    <div className="flex items-center gap-2">
      <ChatAvatar chat={chat} />
      <h3 className="text-2xl font-semibold">{chat.name}</h3>
    </div>
  );

  return (
    <ConfirmDialog
      title={getTitle()}
      description={getDescription()}
      icon={deleteIcon}
      confirmText={t("common.actions.delete")}
      onRedAction={handleDeleteChat}
      onCancel={closeModal}
    >
      {chatInfo}
    </ConfirmDialog>
  );
};

export default DeleteChatModal;