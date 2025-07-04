// components/ui/MessageReplyPreview.tsx
import React from "react";
import { MessageResponse } from "@/types/responses/message.response";
import { ChatType } from "@/types/enums/ChatType";
import { Avatar } from "./avatar/Avatar";
import classNames from "classnames";
import { scrollToMessageById } from "@/utils/scrollToMessageById";

interface MessageReplyPreviewProps {
  message: MessageResponse;
  chatType: ChatType;
  isMe: boolean;
  isSelfReply?: boolean;
  isReplyToMe?: boolean;
}

const MessageReplyPreview: React.FC<MessageReplyPreviewProps> = ({
  message,
  chatType = ChatType.DIRECT,
  isMe = false,
  isSelfReply = false,
  isReplyToMe = false,
}) => {
  if (!message) return null;
  const isNotDirectChat = chatType !== ChatType.DIRECT;

  return (
    <div
      onClick={() => scrollToMessageById(message.id, { smooth: false })}
      className={classNames(
        "message-bubble opacity-60 scale-75 max-w-full inline-block hover:scale-90 hover:opacity-90 transition-transform duration-200",
        {
          "self-message ": isReplyToMe,
          // "translate-x-6 ": !isMe && isReplyToMe,
          // "-translate-x-6 ": !isSelfReply,
        }
      )}
    >
      {message.forwardedFromMessage ? (
        <div className="truncate opacity-80 mb-2 flex gap-2 items-center">
          {isSelfReply ? (
            <>
              {message.forwardedFromMessage?.content}
              <span className="material-symbols-outlined -rotate-90">
                arrow_warm_up
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined rotate-90">
                arrow_warm_up
              </span>
              {message.forwardedFromMessage?.content}
            </>
          )}
        </div>
      ) : (
        <>
          {message.attachments && message.attachments.length > 0 && (
            <div className={`truncate opacity-80 mb-2`}>{"[Attachment]"}</div>
          )}
          <div className={`truncate opacity-80 mb-2`}>{message.content}</div>
        </>
      )}

      <div className="flex items-center gap-1">
        {isNotDirectChat && !isSelfReply && !isReplyToMe && (
          <Avatar
            avatarUrl={message.sender.avatarUrl}
            name={message.sender.displayName}
            size="8"
          />
        )}
        {isNotDirectChat && !isSelfReply && !isReplyToMe && (
          <h1 className="font-semibold">{message.sender.displayName}</h1>
        )}
      </div>

      {isSelfReply ? (
        <span
          className={classNames(
            "material-symbols-outlined text-4xl rotate-180 absolute",
            {
              "-bottom-5 -right-8 scale-x-[-1]": isMe,
              "-bottom-5 -left-8": !isMe,
            }
          )}
        >
          undo
        </span>
      ) : (
        <span
          className={classNames(
            "material-symbols-outlined text-4xl absolute z-70 rotate-180",
            {
              "-bottom-8 -left-1": isMe,
              "-bottom-8 -right-1 scale-x-[-1]": !isMe,
            }
          )}
        >
          reply
        </span>
      )}
    </div>
  );
};

export default React.memo(MessageReplyPreview);
