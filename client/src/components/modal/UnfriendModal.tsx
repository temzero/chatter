// components/modals/UnfriendModal.tsx
import React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { DirectChatMember } from "@/shared/types/responses/chat-member.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { toast } from "react-toastify";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";
import Button from "../ui/buttons/Button";

interface UnfriendModalData {
  userToUnfriend: DirectChatMember;
}

const UnfriendModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const setSidebarInfo = getSetSidebarInfo();
  const deleteFriendship = useFriendshipStore.getState().deleteFriendship;
  const data = getModalData() as unknown as UnfriendModalData | undefined;

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
    <>
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-yellow-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            person_cancel
          </span>
          <h2 className="text-2xl">{t("modal.unfriend.title")}</h2>
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
          {t("modal.unfriend.description")}
        </p>
      </div>

      <div className="flex custom-border-t">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleUnfriend}
          className="text-yellow-500"
        >
          {t("common.actions.unfriend")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default UnfriendModal;
