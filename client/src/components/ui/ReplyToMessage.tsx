// components/ui/ReplyToMessage.tsx
import React from "react";
import { MessageResponse } from "@/types/messageResponse";
import { useCurrentUserId } from "@/stores/authStore";
import { Avatar } from "./avatar/Avatar";
import { formatTime } from "@/utils/formatTime";
import { motion } from "framer-motion";

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
    <motion.div
      key={replyToMessage.id}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      // exit={{ y: 0, opacity: 0 }}
      // transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full p-2 rounded bg-muted mb-2 flex justify-between items-center"
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center -space-y-2">
          <h1 className="text-[10px] opacity-60">
            {formatTime(replyToMessage.createdAt)}
          </h1>
          <span className="material-symbols-outlined text-3xl rotate-180">
            reply
          </span>
        </div>

        {isMe || (
          <Avatar
            avatarUrl={replyToMessage.senderAvatarUrl}
            name={
              replyToMessage.senderNickname || replyToMessage.senderFirstName
            }
            className="-mr-1"
          />
        )}
        <p className={`message-bubble ${isMe && "self-message"}`}>
          {replyToMessage.content || "Attachment"}
        </p>
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
    </motion.div>
  );
};

export default React.memo(ReplyToMessage);
