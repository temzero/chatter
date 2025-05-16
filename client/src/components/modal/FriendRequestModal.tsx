// FriendRequestModal.tsx
import { userService } from "@/services/userService";
import React, { useRef, useState } from "react";
import { useModalStore } from "@/stores/modalStore";
import { Avatar } from "../ui/avatar/Avatar";

interface FriendRequestModalProps {
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

const FriendRequestModal: React.FC<FriendRequestModalProps> = ({ user }) => {
  const closeModal = useModalStore((s) => s.closeModal);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [charCount, setCharCount] = useState(0);
  const maxChar = 200;

  const handleFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.sendFriendRequest({
        recipientId: user.id,
        message: textareaRef.current?.value.trim() || "", // Always a string
      });

      closeModal();
    } catch (err: unknown) {
      console.error("Failed to send friend request:", err);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
  };

  return (
    <div className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded p-4 max-w-xl w-[400px] custom-border">
      <div className="flex items-center gap-4 mb-4">
        <Avatar user={user} size="12" />

        <div>
          <h1 className="text-xl font-semibold">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-sm opacity-80">@{user.username}</p>
        </div>
      </div>

      <form
        className="w-full custom-border-t pt-4"
        onSubmit={handleFriendRequest}
      >
        <textarea
          id="friend-request-message"
          ref={textareaRef}
          placeholder="Optional message..."
          className="w-full min-h-28 px-2"
          maxLength={maxChar}
          onChange={handleTextChange}
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
    </div>
  );
};

export default FriendRequestModal;
