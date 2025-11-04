import { useState, useMemo, useEffect } from "react";
import { useActiveChat } from "@/stores/chatStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { handleError } from "@/common/utils/handleError";
import { toast } from "react-toastify";
import {
  useChatMemberStore,
  getDirectChatPartner,
  getMyActiveChatMember,
} from "@/stores/chatMemberStore";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { useTranslation } from "react-i18next";

const DirectChatEdit = () => {
  const { t } = useTranslation();
  const activeChat = useActiveChat() as ChatResponse;
  const myMember = getMyActiveChatMember(activeChat.myMemberId);
  const openModal = getOpenModal();
  const updateMemberNickname =
    useChatMemberStore.getState().updateMemberNickname;
  const setSidebarInfo = getSetSidebarInfo();

  const chatPartner = getDirectChatPartner(
    activeChat.id,
    activeChat.myMemberId
  ) as ChatMemberResponse;

  const initialFormData = useMemo(
    () => ({
      partnerNickname: chatPartner?.nickname || "",
      myNickname: myMember?.nickname || "",
    }),
    [chatPartner?.nickname, myMember?.nickname]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const isChanged =
      formData.partnerNickname !== initialFormData.partnerNickname ||
      formData.myNickname !== initialFormData.myNickname;
    setHasChanges(isChanged);
  }, [formData, initialFormData]);

  // if (!activeChat || activeChat.type !== "direct" || chatPartner) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat?.id || !chatPartner) return;

    try {
      if (formData.partnerNickname !== initialFormData.partnerNickname) {
        await updateMemberNickname(
          activeChat.id,
          chatPartner.id,
          formData.partnerNickname
        );
      }

      if (!myMember) return;

      if (formData.myNickname !== initialFormData.myNickname) {
        await updateMemberNickname(
          activeChat.id,
          myMember.id,
          formData.myNickname
        );
      }

      setSidebarInfo(SidebarInfoMode.DEFAULT);
      toast.success(t("common.messages.update_success"));
    } catch (error) {
      handleError(error, "Failed to update nickname");
    }
  };

  const handleOpenUnfriendModal = () => {
    openModal(ModalType.UNFRIEND, {
      userToUnfriend: chatPartner,
    });
  };

  const handleOpenLeaveChatModal = () => {
    openModal(ModalType.LEAVE_CHAT, {
      chat: activeChat,
    });
  };
  const handleOpenDeleteChatModal = () => {
    openModal(ModalType.DELETE_CHAT, { chat: activeChat });
  };

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">
          {t("sidebar_info.edit.title")}
        </h1>
        <div className="flex gap-1">
          {hasChanges && (
            <button
              className="flex items-center justify-center rounded-full cursor-pointer hover:opacity-100 text-green-400 h-10 w-10 hover:bg-green-500 hover:text-white"
              onClick={handleSubmit}
            >
              <i className="material-symbols-outlined text-3xl">check</i>
            </button>
          )}
          <button
            className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)]"
            onClick={() => setSidebarInfo(SidebarInfoMode.DEFAULT)}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>
      </header>

      <div className="overflow-y-auto h-screen">
        <div className="flex gap-4 p-4 items-center">
          <Avatar
            avatarUrl={chatPartner.avatarUrl}
            name={chatPartner.firstName}
            size={12}
          />
          <div>
            <h1 className="text-xl font-semibold">
              {chatPartner.firstName} {chatPartner.lastName}
            </h1>
            {chatPartner.nickname && (
              <p className="text-sm opacity-70">{chatPartner.nickname}</p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center p-4 gap-4 w-full"
        >
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">
                {t("sidebar_info.edit.set_partner_nickname", {
                  name: chatPartner.firstName,
                })}
              </label>
              <input
                type="text"
                name="partnerNickname"
                value={formData.partnerNickname}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">
                {t("sidebar_info.edit.set_my_nickname")}
              </label>
              <input
                type="text"
                name="myNickname"
                value={formData.myNickname}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </form>

        <div className="custom-border border-b-0 absolute bottom-0 w-full overflow-hidden shadow-xl rounded-t-xl">
          {chatPartner.friendshipStatus === FriendshipStatus.ACCEPTED && (
            <button
              className="flex gap-2 justify-center items-center p-2 text-orange-500 w-full font-medium rounded-none custom-border-t"
              onClick={handleOpenUnfriendModal}
            >
              <span className="material-symbols-outlined">person_cancel</span>
              {t("sidebar_info.edit.unfriend")}
            </button>
          )}

          <button
            className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium custom-border-t"
            onClick={handleOpenLeaveChatModal}
          >
            <span className="material-symbols-outlined">logout</span>
            {t("sidebar_info.edit.leave_chat")}
          </button>

          <button
            className="flex justify-center items-center p-2 text-red-500 w-full font-medium custom-border-t"
            onClick={handleOpenDeleteChatModal}
          >
            <i className="material-symbols-outlined">delete</i>
            {t("sidebar_info.edit.delete_chat")}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DirectChatEdit;
