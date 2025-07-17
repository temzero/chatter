// components/modals/BlockUserModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { Avatar } from "../ui/avatar/Avatar";
import { toast } from "react-toastify";
import { blockService } from "@/services/blockService";
import { useChatMemberStore } from "@/stores/chatMemberStore";

const BlockUserModal: React.FC = () => {
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const updateMemberLocally = useChatMemberStore.getState().updateMemberLocally;

  // Extract user data from modal props
  const userToBlock = modalContent?.props?.userToBlock as DirectChatMember;
  if (!userToBlock) return null;

  const handleBlock = async () => {
    try {
      await blockService.blockUser({ blockedId: userToBlock.userId });
      updateMemberLocally(userToBlock.chatId, userToBlock.id, {
        isBlockedByMe: true,
      });
      toast.success(
        `${userToBlock.username || userToBlock.firstName} has been blocked`
      );
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
              avatarUrl={userToBlock.avatarUrl}
              name={userToBlock.nickname || userToBlock.firstName}
            />
            <span className="absolute inset-0 flex items-center justify-center text-red-500 opacity-50 hover:opacity-100 cursor-pointer transition-opacity duration-200">
              <i className="material-symbols-outlined text-6xl rotate-90">
                block
              </i>
            </span>
          </div>

          <div>
            <h3 className="font-medium">{userToBlock.username}</h3>
            <p className="text-sm opacity-70">{userToBlock.email}</p>
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
