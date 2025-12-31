// components/modals/BlockUserModal.tsx
import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { toast } from "react-toastify";
import { blockService } from "@/services/http/blockService";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./layout/ConfirmDialog";

interface BlockUserModalData {
  userToBlock: ChatMemberResponse;
}

const BlockUserModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const updateMemberLocally =
    useChatMemberStore.getState().updateMemberLocally;

  const data = getModalData() as unknown as BlockUserModalData;
  const userToBlock = data?.userToBlock;

  if (!userToBlock) return null;

  const handleBlock = async () => {
    try {
      await blockService.blockUser({ blockedId: userToBlock.userId });

      updateMemberLocally(userToBlock.chatId, userToBlock.id, {
        isBlockedByMe: true,
      });

      toast.success(
        t("modal.block_user.success", {
          username: userToBlock.username || userToBlock.firstName,
        })
      );
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error(t("modal.block_user.error"));
    } finally {
      closeModal();
    }
  };

  return (
    <ConfirmDialog
      title={t("modal.block_user.title", {
        name: userToBlock.firstName,
      })}
      icon={
        <i className="material-symbols-outlined text-4xl! rotate-90">
          block
        </i>
      }
      description={t("modal.block_user.description")}
      confirmText={t("common.actions.block")}
      onRedAction={handleBlock}
    >
      {/* ===== CUSTOM BODY ===== */}
      <div className="flex items-center gap-3">
        <div className="relative select-none">
          <Avatar
            avatarUrl={userToBlock.avatarUrl}
            name={userToBlock.nickname || userToBlock.firstName}
          />
          <span className="absolute inset-0 flex items-center justify-center text-red-500 opacity-50">
            <i className="material-symbols-outlined text-6xl! rotate-90">
              block
            </i>
          </span>
        </div>

        <div>
          <h3 className="font-medium">{userToBlock.username}</h3>
          <p className="text-sm opacity-70">{userToBlock.email}</p>
        </div>
      </div>
    </ConfirmDialog>
  );
};

export default BlockUserModal;
