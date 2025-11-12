// componen@/components/ui/MessageHorizontalPreview.tsx
import clsx from "clsx";
import React, { useRef } from "react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { getCurrentUserId } from "@/stores/authStore";
import RenderAttachment from "@/components/ui/attachments/RenderAttachment";
import RenderPinnedAttachment from "@/components/ui/attachments/RenderPinnedAttachment";
import { MessageHorizontalPreviewTypes } from "@/common/enums/MessageHorizontalPreviewTypes";
import {
  SystemMessageContent,
  SystemMessageJSONContent,
} from "@/components/ui/messages/content/SystemMessageContent";
import logger from "@/common/utils/logger";

interface MessageHorizontalPreviewProps {
  message: MessageResponse;
  chatType?: ChatType;
  isBubble?: boolean;
  type: MessageHorizontalPreviewTypes;
}

export const MessageHorizontalPreview: React.FC<
  MessageHorizontalPreviewProps
> = ({ message, chatType = ChatType.DIRECT, isBubble = false, type }) => {
  const currentUserId = getCurrentUserId();

  const isMe = currentUserId === message.sender.id;

  const isSystemMessage = !!message.systemEvent;

  const isGroupChat = chatType === ChatType.GROUP;
  const forwardedMessage = message.forwardedFromMessage;
  const isForwardedFromMe =
    currentUserId === message.forwardedFromMessage?.sender.id;

  const messageRef = useRef<HTMLDivElement | null>(null);

  const containerClass = clsx("flex items-center gap-2", {
    "bg-[--message-color] py-1 px-2 rounded": isBubble,
    "bg-[--primary-green]": isBubble && isMe,
  });

  const nestedMessageClass = clsx("flex gap-2 items-center", {
    "bg-[--message-color] p-1 rounded": isBubble,
    "bg-[--primary-green]": isBubble && isForwardedFromMe,
  });

  const messageTextClass = clsx("overflow-hidden", {
    "font-semibold opacity-70": !!forwardedMessage,
    truncate: type === MessageHorizontalPreviewTypes.PIN,
    "line-clamp-2":
      type === MessageHorizontalPreviewTypes.REPLY_CHANNEL_MESSAGE,
  });

  if (!currentUserId) {
    logger.error({ prefix: "AUTH" }, "Not authenticated");
    return;
  }

  return (
    <div ref={messageRef} className={containerClass}>
      {isGroupChat && !isMe && (
        <Avatar
          avatarUrl={message.sender.avatarUrl}
          name={message.sender.displayName}
          size={6}
        />
      )}

      {message?.attachments && message?.attachments?.length > 0 && (
        <div className="flex gap-1">
          {message.attachments.map((attachment, index) => (
            <RenderPinnedAttachment
              index={index}
              key={attachment.id}
              attachment={attachment}
            />
          ))}
        </div>
      )}

      {isSystemMessage ? (
        <SystemMessageContent
          systemEvent={message.systemEvent}
          currentUserId={currentUserId}
          senderId={message.sender.id}
          senderDisplayName={message.sender.displayName}
          JSONcontent={message.content as SystemMessageJSONContent}
          className={messageTextClass}
        />
      ) : (
        <p className={messageTextClass}>{message.content}</p>
      )}
      {forwardedMessage && (
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined rotate-90 opacity-60">
            arrow_warm_up
          </span>
          <div className={nestedMessageClass}>
            {!isForwardedFromMe && (
              <Avatar
                avatarUrl={forwardedMessage?.sender.avatarUrl}
                name={forwardedMessage?.sender.displayName}
                size={6}
              />
            )}
            <p className={messageTextClass}>{forwardedMessage?.content}</p>

            {forwardedMessage?.attachments &&
              forwardedMessage?.attachments?.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {forwardedMessage.attachments.map((attachment) => (
                    <RenderAttachment
                      key={attachment.id}
                      attachment={attachment}
                      className="w-full h-full max-h-16 object-cover rounded"
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
