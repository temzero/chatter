// components/modals/DeleteMessageModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { useCurrentUserId } from "@/stores/authStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useMessageStore } from "@/stores/messageStore";
import { MessageHorizontalPreview } from "../chat/MessageHorizontalPreview";
import { MessageHorizontalPreviewTypes } from "@/types/enums/MessageHorizontalPreviewTypes";

const DeleteMessageModal: React.FC = () => {
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const messageId = modalContent?.props?.messageId as string;

  const currentUserId = useCurrentUserId();
  const message = useMessageStore.getState().getMessageById(messageId);
  if (!message) return;
  const isMe = message.sender.id === currentUserId;

  const handleDelete = (isDeleteForEveryone: boolean = false) => {
    chatWebSocketService.deleteMessage({
      chatId: message.chatId,
      messageId: message.id,
      isDeleteForEveryone,
    });
    closeModal();
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-3">
          <span className="material-symbols-outlined text-3xl">chat_error</span>
          <h2 className="text-2xl font-semibold">Delete Message</h2>
        </div>
        <p className="mb-6 text-sm text-gray-400">
          Are you sure you want to delete this message? <br />
          This action cannot be undone.
        </p>
        <div className="w-full p-2 custom-border rounded-lg bg-[--message-color]">
          <MessageHorizontalPreview
            message={message}
            type={MessageHorizontalPreviewTypes.DELETE}
          />
        </div>

        {/* <MessagePreview message={message} /> */}
      </div>
      <div className="flex custom-border-t">
        <button
          className="p-3 hover:text-yellow-500 opacity-60 hover:opacity-100 flex-1"
          onClick={() => handleDelete(false)}
        >
          Delete for me
        </button>
        {isMe && (
          <button
            className="p-3 hover:text-red-500 opacity-60 hover:opacity-100 flex-1"
            onClick={() => handleDelete(true)}
          >
            Delete for everyone
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DeleteMessageModal;
