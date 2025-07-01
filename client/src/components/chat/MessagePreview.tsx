import React from "react";
import classNames from "classnames";
import { formatDateTime } from "@/utils/formatDate";
import { Avatar } from "../ui/avatar/Avatar";
import type { MessageResponse } from "@/types/responses/message.response";
import { useCurrentUserId } from "@/stores/authStore";

interface MessagePreviewProps {
  message: MessageResponse;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ message }) => {
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const media =
    message.attachments?.map((attachment) => ({
      id: attachment.id,
      url: attachment.url,
      type: attachment.type,
    })) || [];

  const previewText = (() => {
    if (media.length > 0) return "[Media]";
    if (message.forwardedFromMessage) return "Forwarded message";
    if (message.replyToMessage)
      return `Reply: ${message.replyToMessage.content || "Message"}`;
    return message.content || "";
  })();

  return (
    <div
      className={classNames("rounded p-2", {
        "bg-[var(--primary-green)]": isMe,
        "bg-[var(--message-color)]": !isMe,
      })}
    >
      <div className="flex gap-2 items-center w-full pb-2 mb-2 border-b border-[var(--input-border-color)]">
        <Avatar
          avatarUrl={message.sender.avatarUrl}
          name={message.sender.displayName}
          size="7"
        />
        {isMe ? (
          "Me"
        ) : (
          <span className="font-semibold truncate">
            {message.sender.displayName}
          </span>
        )}
        <span className="text-xs opacity-70 ml-auto">
          {formatDateTime(message.createdAt)}
        </span>
      </div>
      <p>{previewText}</p>
    </div>
  );
};

export default MessagePreview;
