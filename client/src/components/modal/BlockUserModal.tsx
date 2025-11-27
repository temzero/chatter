// components/modals/BlockUserModal.tsx
import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { toast } from "react-toastify";
import { blockService } from "@/services/http/blockService";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useTranslation } from "react-i18next";
import Button from "../ui/buttons/Button";

interface BlockUserModalData {
  userToBlock: ChatMemberResponse;
}

const BlockUserModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const updateMemberLocally = useChatMemberStore.getState().updateMemberLocally;
  const data = getModalData() as unknown as BlockUserModalData | undefined;

  // Extract user data from modal props
  const userToBlock = data?.userToBlock as ChatMemberResponse;
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
      toast.error("Failed to block user");
    } finally {
      closeModal();
    }
  };

  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-red-500">
          {t("modal.block_user.title", { name: userToBlock.firstName })}
        </h2>

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
          {t("modal.block_user.description")}
        </p>
      </div>
      <div className="flex custom-border-t">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleBlock}
          className="text-red-500"
        >
          {t("common.actions.block")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default BlockUserModal;
