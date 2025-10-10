// components/modals/ForwardMessageModal.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  AttachmentResponse,
  MessageResponse,
} from "@/types/responses/message.response";
import { useModalStore } from "@/stores/modalStore";
import { useChatStore } from "@/stores/chatStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { ForwardMessageRequest } from "@/types/requests/forwardMessage.request";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import SearchBar from "../ui/SearchBar";
import { modalAnimations } from "@/animations/modalAnimations";
import { AttachmentType } from "@/types/enums/attachmentType";
import { AttachmentUploadRequest } from "@/types/requests/sendMessage.request";
import { ChatType } from "@/types/enums/ChatType";
import { useTranslation } from "react-i18next";

const ForwardMessageModal: React.FC = () => {
  const { t } = useTranslation();
  const modalContent = useModalStore((state) => state.modalContent);
  const message = modalContent?.props?.message as MessageResponse | undefined;
  const attachment = modalContent?.props?.attachment as
    | AttachmentResponse
    | undefined;
  const closeModal = useModalStore((state) => state.closeModal);
  const filteredChats = useChatStore((state) => state.filteredChats);

  const forwardChats = filteredChats.filter(
    (chat) =>
      (message ? chat.id !== message.chatId : true) &&
      chat.type !== ChatType.CHANNEL
  );

  const handleForward = async (chatId: string) => {
    try {
      if (message) {
        console.log("forward Message", message);
        const alreadyForwarded = message.forwardedFromMessage;
        const originalMessageId = alreadyForwarded?.id || message.id;

        const payload: ForwardMessageRequest = {
          chatId,
          messageId: originalMessageId,
        };

        chatWebSocketService.forwardMessage(payload);
      } else if (attachment) {
        console.log("forward Attachment", attachment);

        const attachmentPayload: AttachmentUploadRequest = {
          url: attachment.url,
          type: attachment.type as AttachmentType,
          filename: attachment.filename || "untitled",
          size: attachment.size || 0,
          mimeType: attachment.mimeType || undefined,
          width: attachment.width || undefined,
          height: attachment.height || undefined,
          duration: attachment.duration || undefined,
        };

        const payload = {
          chatId,
          content: "", // No text content
          attachments: [attachmentPayload],
        };

        chatWebSocketService.sendMessage(payload);
      }

      closeModal();
    } catch (error) {
      console.error("Failed to forward:", error);
    }
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded p-4 max-w-xl w-[400px] custom-border"
      style={{ zIndex: 100 }}
    >
      <h1 className="font-bold text-center text-xl mb-4 flex items-center justify-center gap-2">
        {message
          ? t("modal.forward_message.title_message")
          : t("modal.forward_message.title_attachment", {
              type: attachment?.type
                ? attachment.type.charAt(0).toUpperCase() +
                  attachment.type.slice(1).toLowerCase()
                : "Attachment",
            })}
      </h1>

      <SearchBar placeholder={t("modal.forward_message.search_placeholder")} />

      <div className="flex flex-col items-start h-[50vh] overflow-y-auto mt-2">
        {forwardChats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center w-full gap-3 p-2 text-left transition custom-border-b"
          >
            <ChatAvatar chat={chat} type="header" />
            <h2 className="font-medium">{chat.name}</h2>
            <button
              className="ml-auto w-10 h-8 opacity-60 hover:opacity-100 rounded hover:bg-[var(--primary-green)] hover:border-2 hover:border-green-400 flex items-center justify-center text-white transition-all duration-300"
              onClick={() => handleForward(chat.id)}
              title={t("common.actions.send")}
            >
              <span className="material-symbols-outlined text-3xl">send</span>
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ForwardMessageModal;
