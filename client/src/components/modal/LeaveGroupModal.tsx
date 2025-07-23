// components/modals/LeaveGroupModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { ChatResponse } from "@/types/responses/chat.response";
import { toast } from "react-toastify";
import { useChatStore } from "@/stores/chatStore";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";

const LeaveGroupModal: React.FC = () => {
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const leaveGroupChat = useChatStore((state) => state.leaveGroupChat);

  const chat = modalContent?.props?.chat as ChatResponse;

  if (!chat) return null;

  const handleLeaveGroup = async () => {
    try {
      await leaveGroupChat(chat.id);
      toast.success("You have left the group");
    } catch (error) {
      console.error("Failed to leave group:", error);
      toast.error("Failed to leave group");
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
        <div className="flex gap-2 items-center mb-4 text-yellow-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            logout
          </span>
          <h2 className="text-2xl">Leave Group</h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ChatAvatar chat={chat} />
          <div>
            <h3 className="font-medium">{chat.name}</h3>
            <p className="text-sm opacity-70">{chat.description}</p>
          </div>
        </div>

        <p className="mb-6 text-sm opacity-70">
          Are you sure you want to leave this group? You’ll no longer receive
          messages from it.
        </p>
      </div>

      <div className="flex custom-border-t">
        <button
          className="p-3 text-yellow-500 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleLeaveGroup}
        >
          Leave
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

export default LeaveGroupModal;
