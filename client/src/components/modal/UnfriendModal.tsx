// components/modals/UnfriendModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { Avatar } from "../ui/avatar/Avatar";
import { toast } from "react-toastify";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";

const UnfriendModal: React.FC = () => {
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const deleteFriendship = useFriendshipStore(
    (state) => state.deleteFriendship
  );
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);

  const userToUnfriend = modalContent?.props
    ?.userToUnfriend as DirectChatMember;
  if (!userToUnfriend) return null;

  const handleUnfriend = async () => {
    closeModal();
    setSidebarInfo(SidebarInfoMode.DEFAULT);
    await deleteFriendship(userToUnfriend.userId);
    toast.success(
      `${
        userToUnfriend.username || userToUnfriend.firstName
      } has been unfriended.`
    );
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-yellow-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            person_cancel
          </span>
          <h2 className="text-2xl">Unfriend</h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar
            avatarUrl={userToUnfriend.avatarUrl}
            name={userToUnfriend.nickname || userToUnfriend.firstName}
          />
          <div>
            <h3 className="font-medium">{userToUnfriend.username}</h3>
            <p className="text-sm opacity-70">{userToUnfriend.email}</p>
          </div>
        </div>

        <p className="mb-6 text-sm opacity-70">
          Unfriending this person will remove them from your friend list and
          stop you both from seeing each other's status.
        </p>
      </div>

      <div className="flex custom-border-t">
        <button
          className="p-3 text-yellow-500 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleUnfriend}
        >
          Unfriend
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

export default UnfriendModal;
