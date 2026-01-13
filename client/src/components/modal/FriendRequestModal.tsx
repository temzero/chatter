import React, { useRef, useState } from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { getCurrentUserId } from "@/stores/authStore";
import { useTranslation } from "react-i18next";
import { handleError } from "@/common/utils/error/handleError";
import { toast } from "react-toastify";
import ConfirmDialog from "./layout/ConfirmDialog";

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
  const data = getModalData() as unknown as FriendRequestModalData;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [requestMessage, setRequestMessage] = useState("");
  const maxChar = 200;

  const receiver = data?.receiver;
  if (!receiver) return null;

  const handleFriendRequest = async () => {
    try {
      await sendFriendRequest(receiver.id, currentUserId, requestMessage);
      closeModal();
      toast.success(
        t("toast.friendship.sent_request", { name: receiver.firstName })
      );
    } catch (error) {
      handleError(error, "Failed to sent friend request");
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequestMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  const receiverInfo = (
    <div className="flex items-center gap-4 custom-border p-2 mb-4 rounded-lg">
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
  );

  const messageForm = (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        handleFriendRequest();
      }}
    >
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
    </form>
  );

  return (
    <ConfirmDialog
      title={t("modal.friend_request.title")}
      confirmText={t("modal.friend_request.send_request")}
      onGreenAction={handleFriendRequest}
      onCancel={closeModal}
    >
      {receiverInfo}
      {messageForm}
    </ConfirmDialog>
  );
};

export default FriendRequestModal;
