// components/modals/BlockUserModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { Avatar } from "../ui/avatar/Avatar";
import { toast } from "react-toastify";
import { blockService } from "@/services/blockService";

const BlockUserModal: React.FC = () => {
  // const { blockUser } = useBlockUser();
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);

  // Extract user data from modal props
  const chatPartner = modalContent?.props?.chatPartner as DirectChatMember;
  if (!chatPartner) return null;

  const handleBlock = async () => {
    try {
      await blockService.blockUser({ blockedId: chatPartner.userId });
      toast.success(`${chatPartner.username || chatPartner.firstName} has been blocked`);
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
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
        <h2 className="text-2xl font-semibold mb-4 text-red-500">Block User</h2>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative select-none">
            <Avatar
              avatarUrl={chatPartner.avatarUrl}
              name={chatPartner.nickname || chatPartner.firstName}
            />
            <span className="absolute inset-0 flex items-center justify-center text-red-500 opacity-50 hover:opacity-100 cursor-pointer transition-opacity duration-200">
              <i className="material-symbols-outlined text-6xl rotate-90">
                block
              </i>
            </span>
          </div>

          <div>
            <h3 className="font-medium">{chatPartner.username}</h3>
            <p className="text-sm opacity-70">{chatPartner.email}</p>
          </div>
        </div>

        <p className="mb-6 text-sm opacity-70">
          Blocking will prevent this user from sending you messages or seeing
          your online status.
        </p>
      </div>
      <div className="flex custom-border-t">
        <button
          className="p-3 text-red-500 hover:bg-[var(--background-secondary)] opacity-80 hover:opacity-100 flex-1"
          onClick={handleBlock}
        >
          Block
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default BlockUserModal;
