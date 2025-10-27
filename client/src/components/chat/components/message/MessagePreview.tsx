import React from "react";
import clsx from "clsx";
import { formatDateTime } from "@/common/utils/format/formatDateTime";
import { Avatar } from "@/components/ui/avatar/Avatar";
import type { MessageResponse } from "@/shared/types/responses/message.response";
import { getCurrentUserId } from "@/stores/authStore";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import ForwardedMessagePreview from "@/components/ui/messages/ForwardMessagePreview";

interface MessagePreviewProps {
  message: MessageResponse;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ message }) => {
  const currentUserId = getCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const attachments = message.attachments || [];
  const repliedMessage = message.replyToMessage;
  const forwardedMessage = message.forwardedFromMessage;

  return (
    <div
      className={clsx("rounded p-2", {
        "bg-[var(--primary-green)]": isMe,
        "bg-[var(--message-color)]": !isMe,
      })}
    >
      <div className="flex gap-1 items-center w-full pb-2">
        <Avatar
          avatarUrl={message.sender.avatarUrl}
          name={message.sender.displayName}
          size="8"
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

      <div className="max-h-[40vh] overflow-y-auto overflow-x-auto rounded">
        {/* Reply Preview */}
        {repliedMessage && (
          <div className="flex gap-2 items-center">
            <span className="material-symbols-outlined rotate-180">reply</span>
            <div
              className={clsx("flex gap-2 border rounded w-full p-2", {
                "bg-[var(--message-color)]":
                  repliedMessage.sender.id !== currentUserId,
              })}
            >
              <Avatar
                avatarUrl={repliedMessage.sender.avatarUrl}
                name={repliedMessage.sender.displayName}
                size="6"
              />
              <p>{repliedMessage.content}</p>
            </div>
          </div>
        )}

        {/* Forwarded Message Preview */}
        {forwardedMessage && (
          <ForwardedMessagePreview message={forwardedMessage} isMe={isMe} />
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <RenderMultipleAttachments
            attachments={attachments}
            className="w-full max-w-full"
          />
        )}
      </div>
      {/* Message Content */}
      {message.content && (
        <p className="pt-2 custom-border-t">{message.content}</p>
      )}
    </div>
  );
};

export default MessagePreview;
