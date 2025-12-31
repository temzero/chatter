// components/modals/UnblockUserModal.tsx
import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { toast } from "react-toastify";
import { blockService } from "@/services/http/blockService";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import ConfirmDialog from "./layout/ConfirmDialog";

interface UnblockUserModalData {
  blockedUser: {
    id: string;
    username?: string;
    firstName?: string;
    avatarUrl?: string;
  };
  onUnblockSuccess?: () => void;
}

const UnblockUserModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const data = getModalData() as unknown as UnblockUserModalData;

  const updateMemberLocallyByUserId =
    useChatMemberStore.getState().updateMemberLocallyByUserId;

  if (!data?.blockedUser) return null;

  const { blockedUser, onUnblockSuccess } = data;

  const handleUnblock = async () => {
    try {
      const response = await blockService.unblockUser(blockedUser.id);

      updateMemberLocallyByUserId(response.blockedId, {
        isBlockedByMe: false,
      });

      onUnblockSuccess?.();
      closeModal();

      toast.success(
        t("modal.unblock_user.success", {
          username: blockedUser.username || blockedUser.firstName,
        })
      );
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error(t("modal.unblock_user.error"));
    }
  };

  return (
    <ConfirmDialog
      title={t("modal.unblock_user.title", {
        name: blockedUser.firstName,
      })}
      description={t("modal.unblock_user.description")}
      confirmText={t("common.actions.unblock")}
      onGreenAction={handleUnblock}
    >
      {/* 👇 custom body */}
      <div className="flex items-center gap-3 mt-3">
        <Avatar
          avatarUrl={blockedUser.avatarUrl}
          name={blockedUser.username || blockedUser.firstName}
        />
        <div>
          <h3 className="font-medium">
            {blockedUser.username || blockedUser.firstName}
          </h3>
        </div>
      </div>
    </ConfirmDialog>
  );
};

export default UnblockUserModal;
