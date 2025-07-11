// FriendRequestModal.tsx
import React, { useRef, useState } from "react";
import { useModalStore } from "@/stores/modalStore";
import { Avatar } from "../ui/avatar/Avatar";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import { useChatStore } from "@/stores/chatStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";

interface FriendRequestModalProps {
  receiver: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  onSuccess?: (status: string) => void;
}

const FriendRequestModal: React.FC = () => {
  const modalContent = useModalStore((state) => state.modalContent);
  const props = modalContent?.props as FriendRequestModalProps | undefined;

  const fetchChatById = useChatStore.getState().fetchChatById;
  const sendFriendRequest = useFriendshipStore.getState().sendFriendRequest;
  const closeModal = useModalStore.getState().closeModal;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [requestMessage, setRequestMessage] = useState("");
  const maxChar = 200;

  if (!props) return null;
  const { receiver, onSuccess } = props;

  const handleFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendFriendRequest(receiver.id, requestMessage);
      if (onSuccess) {
        onSuccess(FriendshipStatus.PENDING);
      }
      closeModal();
      fetchChatById();
    } catch (err: unknown) {
      console.error("Failed to send friend request:", err);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequestMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded p-4 max-w-xl w-[400px] custom-border z-[99]"
    >
      <h1 className="font-bold text-center text-xl">Send Friend Request to</h1>
      <div className="flex items-center gap-4 custom-border p-2 my-4 rounded-lg">
        <Avatar
          avatarUrl={receiver.avatarUrl}
          name={receiver.firstName}
          size="12"
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
          placeholder="Optional message..."
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
          Send Friend Request
        </button>
      </form>
    </motion.div>
  );
};

export default FriendRequestModal;
