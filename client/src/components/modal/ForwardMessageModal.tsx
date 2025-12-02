// components/modals/ForwardMessageModal.tsx
import React, { useState, useMemo } from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { getChats } from "@/stores/chatStore";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { ForwardMessageRequest } from "@/shared/types/requests/forward-message.request";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { useTranslation } from "react-i18next";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import SearchBar from "@/components/ui/SearchBar";

interface ForwardMessageModalData {
  message?: MessageResponse;
  attachment?: AttachmentResponse;
}

const ForwardMessageModal: React.FC = () => {
  console.log("[MOUNTED]", "ForwardMessageModal");

  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const chats = getChats() as ChatResponse[];
  const [searchTerm, setSearchTerm] = useState("");
  const data = getModalData() as unknown as ForwardMessageModalData | undefined;

  const message = data?.message;
  const attachment = data?.attachment;

  const forwardChats = useMemo(() => {
    const filtered = chats.filter((chat) => {
      // Search filter
      if (
        searchTerm &&
        !chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Forward-specific filters
      if (chat.id === message?.chatId) {
        return false;
      }

      if (chat.type === ChatType.CHANNEL) {
        return false;
      }

      return true;
    });

    return filtered;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, searchTerm]);

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="p-4 pb-0">
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

      <SearchBar
        placeholder={t("modal.forward_message.search_placeholder")}
        onSearch={handleSearch}
      />

      <div className="flex flex-col items-start h-[50vh] overflow-y-auto mt-2">
        {forwardChats.length === 0 ? (
          <div className="w-full text-center py-4 text-gray-500">
            {searchTerm
              ? t("common.messages.no_result")
              : t("common.messages.no_chats")}
          </div>
        ) : (
          forwardChats.map((chat: ChatResponse) => (
            <div
              key={chat.id}
              className="flex items-center w-full gap-3 p-2 text-left transition custom-border-b"
            >
              <ChatAvatar chat={chat} type="header" />
              <h2 className="font-medium">{chat.name}</h2>
              <button
                className="ml-auto w-10 h-8 opacity-60 hover:opacity-100 rounded hover:bg-(--primary-green) hover:border-2 hover:border-green-400 flex items-center justify-center text-white transition-all duration-300"
                onClick={() => handleForward(chat.id)}
                title={t("common.actions.send")}
              >
                <span className="material-symbols-outlined text-3xl!">send</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ForwardMessageModal;
