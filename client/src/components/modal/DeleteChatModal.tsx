import React from "react";
import { useModalActions, useModalData } from "@/stores/modalStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";
import Button from "../ui/buttons/Button";

interface DeleteChatModalData {
  chat: ChatResponse;
}

const DeleteChatModal: React.FC = () => {
  const { t } = useTranslation();
  const deleteChat = useChatStore((state) => state.deleteChat);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const { closeModal } = useModalActions();
  const data = useModalData() as unknown as DeleteChatModalData | undefined;

  const chat = data?.chat;
  if (!chat) return null;

  const isDirectChat = chat.type === ChatType.DIRECT;
  const capitalizedChatType =
    chat.type.charAt(0).toUpperCase() + chat.type.slice(1);

  const handleDeleteChat = async () => {
    closeModal();
    setSidebarInfo(SidebarInfoMode.DEFAULT);
    await deleteChat(chat.id);
  };

  return (
    <>
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-red-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            delete
          </span>
          <h2 className="text-2xl">
            {isDirectChat
              ? t("modal.delete_chat.title_direct")
              : t("modal.delete_chat.title_group", {
                  type: capitalizedChatType,
                })}
          </h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ChatAvatar chat={chat} />
          <h3 className="text-2xl font-semibold">{chat.name}</h3>
        </div>

        <p className="mb-6 text-sm opacity-70">
          {t("modal.delete_chat.description_group", {
            type: chat.type.toLowerCase(),
          })}
        </p>
      </div>

      <div className="flex custom-border-t">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleDeleteChat}
          className="text-red-500"
        >
          {t("common.actions.delete")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default DeleteChatModal;
