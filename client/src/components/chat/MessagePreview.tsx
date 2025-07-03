import React from "react";
import classNames from "classnames";
import { formatDateTime } from "@/utils/formatDate";
import { Avatar } from "../ui/avatar/Avatar";
import type { MessageResponse } from "@/types/responses/message.response";
import { useCurrentUserId } from "@/stores/authStore";
import RenderMultipleAttachments from "../ui/RenderMultipleAttachments";
import ForwardedMessagePreview from "../ui/ForwardMessagePreview";

interface MessagePreviewProps {
  message: MessageResponse;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ message }) => {
  const currentUserId = useCurrentUserId();
  const isMe = message.sender.id === currentUserId;

  const attachments = message.attachments || [];
  const repliedMessage = message.replyToMessage;
  const forwardedMessage = message.forwardedFromMessage;

  return (
    <div
      className={classNames("rounded p-2", {
        "bg-[var(--primary-green)]": isMe,
        "bg-[var(--message-color)]": !isMe,
      })}
    >
      <div className="flex gap-2 items-center w-full pb-2">
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

      <div className="max-h-[40vh] overflow-y-auto overflow-x-auto rounded">
        {/* Reply Preview */}
        {repliedMessage && (
          // <MessageReplyPreview
          //   message={repliedMessage}
          //   // chatType={chatType}
          //   isMe={isMe}
          //   isSelfReply={repliedMessage.sender.id === currentUserId && isMe}
          //   isReplyToMe={repliedMessage.sender.id === currentUserId && !isMe}
          // />
          <div className="flex gap-2 items-center">
            <span className="material-symbols-outlined rotate-180">reply</span>
            <div
              className={classNames(
                "flex gap-2 border rounded w-full p-2",
                {
                  // Only add this background class if sender is not current user
                  "bg-[var(--message-color)]":
                    repliedMessage.sender.id !== currentUserId,
                }
              )}
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
            // previewMode={true}
          />
        )}
      </div>
      {/* Message Content */}
      {message.content && (
        <p className="pt-2">
          {message.content}
        </p>
      )}
    </div>
  );
};

export default MessagePreview;
