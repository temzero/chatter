// components/modals/UnfriendModal.tsx
import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { toast } from "react-toastify";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./layout/ConfirmDialog";

interface UnfriendModalData {
  userToUnfriend: ChatMemberResponse;
}

const UnfriendModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const setSidebarInfo = getSetSidebarInfo();
  const deleteFriendship = useFriendshipStore.getState().deleteFriendship;

  const data = getModalData() as unknown as UnfriendModalData;
  const userToUnfriend = data?.userToUnfriend;

  if (!userToUnfriend) return null;

  const handleUnfriend = async () => {
    closeModal();
    setSidebarInfo(SidebarInfoMode.DEFAULT);

    await deleteFriendship(userToUnfriend.userId);

    toast.success(
      t("modal.unfriend.success", {
        name: userToUnfriend.username || userToUnfriend.firstName,
      })
    );
  };

  return (
    <ConfirmDialog
      title={t("modal.unfriend.title")}
      description={t("modal.unfriend.description")}
      confirmText={t("common.actions.unfriend")}
      onYellowAction={handleUnfriend} // 🟡 warning action
      icon={
        <span className="material-symbols-outlined text-4xl!">
          person_cancel
        </span>
      }
    >
      {/* 👇 custom body */}
      <div className="flex items-center gap-3 mt-3">
        <Avatar
          avatarUrl={userToUnfriend.avatarUrl}
          name={userToUnfriend.nickname || userToUnfriend.firstName}
        />
        <div>
          <h3 className="font-medium">{userToUnfriend.username}</h3>
          <p className="text-sm opacity-70">{userToUnfriend.email}</p>
        </div>
      </div>
    </ConfirmDialog>
  );
};

export default UnfriendModal;
