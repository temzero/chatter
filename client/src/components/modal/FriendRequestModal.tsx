// FriendRequestModal.tsx
import React, { useRef, useState } from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { getCurrentUserId } from "@/stores/authStore";
import { useTranslation } from "react-i18next";

interface FriendRequestModalData {
  receiver: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
}

const FriendRequestModal: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  const closeModal = getCloseModal();
  const sendFriendRequest = useFriendshipStore.getState().sendFriendRequest;
  const data = getModalData() as unknown as FriendRequestModalData | undefined;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [requestMessage, setRequestMessage] = useState("");
  const maxChar = 200;

  const receiver = data?.receiver;
  if (!receiver) return null;

  const handleFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    closeModal();
    await sendFriendRequest(
      receiver.id,
      receiver.firstName,
      currentUserId,
      requestMessage
    );
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequestMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <>
      <h1 className="font-bold text-center text-xl">
        {t("modal.friend_request.title")}
      </h1>
      <div className="flex items-center gap-4 custom-border p-2 my-4 rounded-lg">
        <Avatar
          avatarUrl={receiver.avatarUrl}
          name={receiver.firstName}
          size={12}
        />

        <div>
          <h1 className="text-xl font-semibold">
            {receiver.firstName} {receiver.lastName}
          </h1>
          {receiver.username && (
            <p className="text-sm opacity-80">@{receiver.username}</p>
          )}
        </div>
      </div>

      <form className="w-full" onSubmit={handleFriendRequest}>
        <textarea
          id="friend-request-message"
          ref={textareaRef}
          placeholder={t("modal.friend_request.optional_message")}
          className="w-full min-h-28 px-2"
          maxLength={maxChar}
          onChange={handleTextChange}
          value={requestMessage}
          autoFocus
        />
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs opacity-60 ml-auto">
            {charCount}/{maxChar}
          </span>
        </div>

        <button
          type="submit"
          className="bg-[var(--primary-green)] text-white w-full py-1 flex gap-2 justify-center"
        >
          {t("modal.friend_request.send_request")}
        </button>
      </form>
    </>
  );
};

export default FriendRequestModal;
