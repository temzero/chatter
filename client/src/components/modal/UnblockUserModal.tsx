// components/modals/UnblockUserModal.tsx
import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { Avatar } from "../ui/avatar/Avatar";
import { blockService } from "@/services/blockService";
import { toast } from "react-toastify";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useTranslation } from "react-i18next";

const UnblockUserModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const updateMemberLocally = useChatMemberStore.getState().updateMemberLocally;

  // Extract user data from modal props
  const blockedUser = modalContent?.props?.blockedUser as DirectChatMember;
  if (!blockedUser) return null;
  const onUnblockSuccess = modalContent?.props?.onUnblockSuccess as
    | (() => void)
    | undefined;

  const handleUnblock = async () => {
    try {
      console.log("handleUnblock, blockedUser", blockedUser);
      await blockService.unblockUser(blockedUser.id);
      updateMemberLocally(blockedUser.chatId, blockedUser.id, {
        isBlockedByMe: false,
      });
      onUnblockSuccess?.();
      toast.success(
        t("modals.unblock_user.toast_success", {
          username: blockedUser.username || blockedUser.firstName,
        })
      );
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error(t("modals.unblock_user.toast_error"));
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
        {/* Changed to green color and "Unblock User" title */}
        <div className="flex gap-2 items-center mb-4 text-[--primary-green] font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            lock_open_right
          </span>
          <h2 className="text-2xl">{t("modals.unblock_user.title")}</h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar
            avatarUrl={blockedUser.avatarUrl}
            name={blockedUser.nickname || blockedUser.firstName}
            isBlocked={true}
          />
          <div>
            <h3 className="font-medium">{blockedUser.username}</h3>
            <p className="text-sm opacity-70">{blockedUser.email}</p>
          </div>
        </div>

        {/* Updated description text */}
        <p className="mb-6 text-sm opacity-70">
          {t("modals.unblock_user.description")}
        </p>
      </div>
      <div className="flex custom-border-t">
        {/* Changed button text and color to green */}
        <button
          className="p-3 text-[--primary-green] hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleUnblock}
        >
          {t("common.actions.unblock")}
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

export default UnblockUserModal;
