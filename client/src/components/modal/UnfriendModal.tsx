// components/modals/UnfriendModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { modalAnimations } from "@/animations/modalAnimations";
import { DirectChatMember } from "@/shared/types/responses/chat-member.response";
import { Avatar } from "../ui/avatar/Avatar";
import { toast } from "react-toastify";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";

const UnfriendModal: React.FC = () => {
  const { t } = useTranslation();
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
      t("modals.unfriend.success", {
        name: userToUnfriend.username || userToUnfriend.firstName,
      })
    );
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border"
      style={{ zIndex: 100 }}
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-yellow-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            person_cancel
          </span>
          <h2 className="text-2xl">{t("modals.unfriend.title")}</h2>
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
          {t("modals.unfriend.description")}
        </p>
      </div>

      <div className="flex custom-border-t">
        <button
          className="p-3 text-yellow-500 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleUnfriend}
        >
          {t("common.actions.unfriend")}
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          {t("common.actions.cancel")}
        </button>
      </div>
    </motion.div>
  );
};

export default UnfriendModal;
