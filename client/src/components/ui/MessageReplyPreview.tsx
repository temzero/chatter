// components/ui/MessageReplyPreview.tsx
import React from "react";
import { MessageResponse } from "@/types/messageResponse";
import { useCurrentUserId } from "@/stores/authStore";

interface MessageReplyPreviewProps {
  message: MessageResponse;
}

const MessageReplyPreview: React.FC<MessageReplyPreviewProps> = ({
  message,
}) => {
  const currentUserId = useCurrentUserId();
  const isMe = message.senderId === currentUserId;

  return (
    <div className={`message-bubble ${isMe && "self-message"}  opacity-60`}>
      <h1 className="font-semibold">
        {isMe ? "Me" : `${message.senderNickname || message.senderFirstName}`}
      </h1>
      <div className={`truncate opacity-40`}>
        {message.content || "[media/attachment]"}
      </div>
    </div>
  );
};

export default React.memo(MessageReplyPreview);
