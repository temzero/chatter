import { useState, useMemo, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { ChatResponse } from "@/types/responses/chat.response";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { handleError } from "@/utils/handleError";
import { toast } from "react-toastify";
import { useChatMemberStore, useActiveMembers } from "@/stores/chatMemberStore";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { ModalType, useModalStore } from "@/stores/modalStore";

const DirectChatEdit = () => {
  const activeChat = useChatStore((state) => state.activeChat) as ChatResponse;
  const updateMemberNickname = useChatMemberStore(
    (state) => state.updateMemberNickname
  );
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const chatMembers = useActiveMembers();
  const openModal = useModalStore((state) => state.openModal);

  const chatPartner = chatMembers?.find(
    (member) => member.id !== activeChat.myMemberId
  ) as DirectChatMember;

  const initialFormData = useMemo(
    () => ({
      partnerNickname: chatPartner?.nickname || "",
      myNickname:
        chatMembers?.find((m) => m.id === activeChat.myMemberId)?.nickname ||
        "",
    }),
    [chatPartner?.nickname, chatMembers, activeChat.myMemberId]
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

      const myMember = chatMembers?.find((m) => m.id === activeChat.myMemberId);
      if (!myMember) return;

      if (formData.myNickname !== initialFormData.myNickname) {
        await updateMemberNickname(
          activeChat.id,
          myMember.id,
          formData.myNickname
        );
      }

      setSidebarInfo("default");
      toast.success("Update successfully");
    } catch (error) {
      handleError(error, "Failed to update nickname");
    }
  };

  const handleOpenUnfriendModal = () => {
    openModal(ModalType.UNFRIEND, {
      userToUnfriend: chatPartner,
    });
  };

  const handleOpenDeleteChatModal = () => {
    openModal(ModalType.DELETE_CHAT, {
      chat: activeChat,
      chatPartner,
    });
  };

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">Edit Chat</h1>
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
            onClick={() => setSidebarInfo("default")}
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
            size="12"
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
                Set {chatPartner.firstName}'s Nickname
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
              <label className="text-sm opacity-70">Set My Nickname</label>
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

        <div className="custom-border-t absolute bottom-0 w-full flex">
          {chatPartner.friendshipStatus === FriendshipStatus.ACCEPTED && (
            <button
              className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium rounded-none custom-border-r"
              onClick={handleOpenUnfriendModal}
            >
              <span className="material-symbols-outlined">person_cancel</span>
              Unfriend
            </button>
          )}

          <button
            className="flex justify-center items-center p-2 text-red-500 w-full font-medium"
            onClick={handleOpenDeleteChatModal}
          >
            <i className="material-symbols-outlined">delete</i>
            Delete Chat
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DirectChatEdit;
