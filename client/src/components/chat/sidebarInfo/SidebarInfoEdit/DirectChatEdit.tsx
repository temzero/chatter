import { useState, useMemo, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { DirectChatResponse } from "@/types/chat";
import { useCurrentUser } from "@/stores/authStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/types/friendship";
import { handleError } from "@/utils/handleError";
import { toast } from "react-toastify";
import { useChatMemberStore } from "@/stores/chatMemberStore";

const DirectChatEdit = () => {
  const currentUser = useCurrentUser();
  const activeChat = useChatStore(
    (state) => state.activeChat
  ) as DirectChatResponse;
  const fetchChatById = useChatStore((state) => state.fetchChatById);
  const chatPartner = activeChat.chatPartner;
  const deleteChat = useChatStore((state) => state.deleteChat);
  const updateMemberNickname = useChatMemberStore(
    (state) => state.updateMemberNickname
  );
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const deleteFriendshipByUserId = useFriendshipStore(
    (state) => state.deleteFriendshipByUserId
  );

  const initialFormData = useMemo(
    () => ({
      partnerNickname: chatPartner?.nickname || "",
      myNickname: activeChat.myNickname || "",
    }),
    [chatPartner, activeChat.myNickname]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [hasChanges, setHasChanges] = useState(false);

  // Compare current form data with initial data to determine if there are changes
  useEffect(() => {
    const isChanged =
      formData.partnerNickname !== initialFormData.partnerNickname ||
      formData.myNickname !== initialFormData.myNickname;
    setHasChanges(isChanged);
  }, [formData, initialFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat?.id) {
      console.error("No active chat ID found");
      return;
    }

    try {
      // Update partner's nickname
      if (formData.partnerNickname !== initialFormData.partnerNickname) {
        await updateMemberNickname(
          activeChat.id,
          chatPartner.userId,
          formData.partnerNickname
        );
      }

      // Update my nickname (you might need a separate action for this)
      if (formData.myNickname !== initialFormData.myNickname) {
        // Assuming you have a way to get current user's ID
        if (!currentUser?.id) {
          console.error("cannot find currentUserID");
          return;
        } // Replace with actual current user ID

        await updateMemberNickname(
          activeChat.id,
          currentUser.id,
          formData.myNickname
        );
      }

      setSidebarInfo("default");
      toast.success('Update successfully')
    } catch (error) {
      handleError(error, 'Failed to update nickname')
    }
  };

  const handleUnfriend = async () => {
    try {
      await deleteFriendshipByUserId(activeChat.chatPartner.userId);
      setSidebarInfo("default");
      fetchChatById();
    } catch (error) {
      console.error("Failed to unfriend:", error);
    }
  };

  if (!activeChat || activeChat.type !== "direct") return null;

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
            firstName={chatPartner.firstName}
            lastName={chatPartner.lastName}
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
          {activeChat.chatPartner.friendshipStatus ===
            FriendshipStatus.ACCEPTED && (
            <button
              className="flex gap-2 justify-center items-center p-2 text-yellow-500 w-full font-medium rounded-none custom-border-r"
              onClick={handleUnfriend}
            >
              <span className="material-symbols-outlined">person_cancel</span>
              Unfriend
            </button>
          )}

          <button
            className="flex justify-center items-center p-2 text-red-500 w-full font-medium"
            onClick={() => deleteChat(activeChat.id, activeChat.type)}
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
