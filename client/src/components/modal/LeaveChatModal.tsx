import React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useTranslation } from "react-i18next";
import Button from "../ui/buttons/Button";

interface LeaveChatModalData {
  chat: ChatResponse;
}

const LeaveChatModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const leaveChat = useChatStore.getState().leaveChat;
  const data = getModalData() as unknown as LeaveChatModalData | undefined;

  const chat = data?.chat;
  if (!chat) return null;

  const isDirectChat = chat.type === ChatType.DIRECT;
  const capitalizedChatType =
    chat.type.charAt(0).toUpperCase() + chat.type.slice(1);

  const handleLeaveChat = async () => {
    await leaveChat(chat.id);
    closeModal();
  };

  return (
    <>
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-yellow-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            logout
          </span>
          <h2 className="text-2xl">
            {isDirectChat
              ? t("modal.leave_chat.title_direct")
              : t("modal.leave_chat.title_group", {
                  type: capitalizedChatType,
                })}
          </h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ChatAvatar chat={chat} />
          <h3 className="font-semibold text-2xl">{chat.name}</h3>
        </div>

        <p className="mb-6 text-sm opacity-70">
          {isDirectChat
            ? t("modal.leave_chat.description_direct")
            : t("modal.leave_chat.description_group", { type: chat.type })}
        </p>
      </div>

      <div className="flex custom-border-t">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleLeaveChat}
          className="text-yellow-500"
        >
          {t("common.actions.leave")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default LeaveChatModal;
