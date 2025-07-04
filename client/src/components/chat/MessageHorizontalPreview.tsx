// components/ui/MessageHorizontalPreview.tsx
import React, { useRef, useState, useEffect } from "react";
import classNames from "classnames";
import { Avatar } from "../ui/avatar/Avatar";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatType } from "@/types/enums/ChatType";
import { useCurrentUserId } from "@/stores/authStore";
import RenderAttachment from "../ui/RenderAttachment";
import RenderPinnedAttachment from "../ui/RenderPinnedAttachment";

interface MessageHorizontalPreviewProps {
  message: MessageResponse;
  chatType?: ChatType;
  isBubble?: boolean;
}

export const MessageHorizontalPreview: React.FC<
  MessageHorizontalPreviewProps
> = ({ message, chatType = ChatType.DIRECT, isBubble = false }) => {
  const currentUserId = useCurrentUserId();
  const isMe = currentUserId === message.sender.id;

  const isGroupChat = chatType === ChatType.GROUP;
  const forwardedMessage = message.forwardedFromMessage;

  // const isReplyToMe = currentUserId === message.replyToMessage?.sender.id;
  const isForwardedFromMe =
    currentUserId === message.forwardedFromMessage?.sender.id;

  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 200);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyText = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
  };

  const messageClass = classNames({
    "bg-[--message-color] py-1 px-2 rounded": isBubble,
    "bg-[--primary-green]": isBubble && isMe,
  });
  const nestedMessageClass = classNames({
    "bg-[--message-color] p-1 rounded": isBubble,
    "bg-[--primary-green]": isBubble && isForwardedFromMe,
  });

  return (
    <div
      ref={messageRef}
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 ${messageClass}`}
    >
      {isGroupChat && !isMe && (
        <Avatar
          avatarUrl={message.sender.avatarUrl}
          name={message.sender.displayName}
          size="6"
        />
      )}

      <p
        className={`break-words max-w-full cursor-pointer transition-all duration-200 ${
          copied ? "scale-110 opacity-60" : ""
        }`}
        onClick={handleCopyText}
      >
        {message.content}
      </p>

      {message?.attachments && message?.attachments?.length > 0 && (
        <div className="flex gap-1">
          {message.attachments.map((attachment) => (
            <RenderPinnedAttachment
              key={attachment.id}
              attachment={attachment}
              className="w-8 h-8 max-h-32 object-cover rounded"
            />
          ))}
        </div>
      )}

      {forwardedMessage && (
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined rotate-90 opacity-60">
            arrow_warm_up
          </span>
          <div className={`flex gap-2 items-center ${nestedMessageClass}`}>
            {!isForwardedFromMe && (
              <Avatar
                avatarUrl={forwardedMessage?.sender.avatarUrl}
                name={forwardedMessage?.sender.displayName}
                size="6"
              />
            )}
            <p className="text-sm font-semibold opacity-70 mr-2">
              {forwardedMessage?.content}
            </p>

            {forwardedMessage?.attachments &&
              forwardedMessage?.attachments?.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {forwardedMessage.attachments.map((attachment) => (
                    <RenderAttachment
                      key={attachment.id}
                      attachment={attachment}
                      className="w-full h-full max-h-32 object-cover rounded"
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
