// components/modals/UnblockUserModal.tsx
import React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { toast } from "react-toastify";
import { blockService } from "@/services/http/blockService";
import { useTranslation } from "react-i18next";
import Button from "../ui/buttons/Button";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import logger from "@/common/utils/logger";

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
      const blockedResponse = await blockService.unblockUser(blockedUser.id);
      updateMemberLocallyByUserId(blockedResponse.blockedId, {
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
      logger.error("Error unblocking user:", error);
      toast.error(t("modal.unblock_user.error"));
    }
  };

  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-green-500">
          {t("modal.unblock_user.title", { name: blockedUser.firstName })}
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <Avatar
            avatarUrl={blockedUser.avatarUrl}
            name={blockedUser.username || blockedUser.firstName}
          />
          <div>
            <h3 className="font-medium">{blockedUser.username}</h3>
          </div>
        </div>

        <p className="mb-6 text-sm opacity-70">
          {t("modal.unblock_user.description")}
        </p>
      </div>

      <div className="flex custom-border-t">
        <Button variant="ghost" fullWidth onClick={handleUnblock}>
          {t("common.actions.unblock")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default UnblockUserModal;
