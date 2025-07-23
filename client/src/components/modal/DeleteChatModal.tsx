// components/modals/DeleteChatModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { ChatResponse } from "@/types/responses/chat.response";
import { Avatar } from "../ui/avatar/Avatar";
import { toast } from "react-toastify";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import { ChatType } from "@/types/enums/ChatType";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";

const DeleteChatModal: React.FC = () => {
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  const chat = modalContent?.props?.chat as ChatResponse;
  const chatPartner = modalContent?.props?.chatPartner as DirectChatMember;

  if (!chat) return null;

  const isDirectChat = chat.type === ChatType.DIRECT;

  const handleDeleteChat = async () => {
    try {
      closeModal();
      setSidebarInfo(SidebarInfoMode.DEFAULT);
      await deleteChat(chat.id, chat.type);
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      closeModal();
    }
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-red-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            delete
          </span>
          <h2 className="text-2xl">Delete Chat</h2>
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
                  {chat.type.charAt(0).toUpperCase() + chat.type.slice(1)} chat
                </p>
              </div>
            </>
          )}
        </div>

        <p className="mb-6 text-sm opacity-70">
          Are you sure you want to delete this chat? You won't be able to see
          the messages again.
        </p>
      </div>

      <div className="flex custom-border-t">
        <button
          className="p-3 text-red-500 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleDeleteChat}
        >
          Delete
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default DeleteChatModal;
