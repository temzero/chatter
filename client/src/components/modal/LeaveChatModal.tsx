import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { ChatResponse } from "@/types/responses/chat.response";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import { Avatar } from "../ui/avatar/Avatar";
import { ChatType } from "@/types/enums/ChatType";
import { useTranslation } from "react-i18next";

const LeaveChatModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const leaveChat = useChatStore((state) => state.leaveChat);

  const chat = modalContent?.props?.chat as ChatResponse;
  const chatPartner = modalContent?.props?.chatPartner as DirectChatMember;

  if (!chat) return null;

  const isDirectChat = chat.type === ChatType.DIRECT;
  const capitalizedChatType =
    chat.type.charAt(0).toUpperCase() + chat.type.slice(1);

  const handleLeaveChat = async () => {
    await leaveChat(chat.id);
    closeModal();
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-yellow-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            logout
          </span>
          <h2 className="text-2xl">
            {isDirectChat
              ? t("common.leave_chat")
              : t("common.leave_chat_type", { type: capitalizedChatType })}
          </h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          {isDirectChat ? (
            <>
              <Avatar
                avatarUrl={chatPartner?.avatarUrl}
                name={chatPartner?.nickname || chatPartner?.firstName}
              />
              <div>
                <h3 className="font-medium">{chatPartner?.username}</h3>
                <p className="text-sm opacity-70">{chatPartner?.email}</p>
              </div>
            </>
          ) : (
            <>
              <ChatAvatar chat={chat} />
              <div>
                <h3 className="font-medium">{chat.name}</h3>
                <p className="text-sm opacity-70">
                  {t("common.chat_type_label", { type: capitalizedChatType })}
                </p>
              </div>
            </>
          )}
        </div>

        <p className="mb-6 text-sm opacity-70">
          {isDirectChat
            ? t("common.leave_chat_confirm")
            : t("common.leave_chat_type_confirm", { type: chat.type })}
        </p>
      </div>

      <div className="flex custom-border-t">
        <button
          className="p-3 text-yellow-500 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleLeaveChat}
        >
          {t("common.action.leave")}
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          {t("common.action.cancel")}
        </button>
      </div>
    </motion.div>
  );
};

export default LeaveChatModal;
