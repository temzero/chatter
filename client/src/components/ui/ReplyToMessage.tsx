// components/ui/ReplyToMessage.tsx
import React from "react";
import { MessageResponse } from "@/types/messageResponse";
import { useCurrentUserId } from "@/stores/authStore";
import { Avatar } from "./avatar/Avatar";

interface ReplyToMessageProps {
  replyToMessage: MessageResponse;
  onCancelReply: () => void;
}

const ReplyToMessage: React.FC<ReplyToMessageProps> = ({
  replyToMessage,
  onCancelReply,
}) => {
  const currentUserId = useCurrentUserId();
  const isMe: boolean = replyToMessage.senderId === currentUserId;

  return (
    <div className="w-full p-2 rounded bg-muted mb-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined">prompt_suggestion</span>
        {/* <div className="flex items-end -space-x-1"> */}
        {isMe || (
          <Avatar
            avatarUrl={replyToMessage.senderAvatarUrl}
            name={
              replyToMessage.senderNickname || replyToMessage.senderFirstName
            }
            className="-mr-1"
          />
        )}
        <div className={`message-bubble ${isMe && "self-message"}`}>
          {replyToMessage.content || "Attachment"}
        </div>
        {/* </div> */}
      </div>
      <button
        className="relative flex items-center justify-center w-6 h-6 bg-[var(--border-color)] opacity-80 hover:opacity-100 rounded-full"
        onClick={onCancelReply}
        aria-label="Cancel reply"
      >
        <span className="material-symbols-outlined text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          close
        </span>
      </button>
    </div>
  );
};

export default React.memo(ReplyToMessage);
