// components/ui/MessageReplyPreview.tsx
import React from "react";
import { MessageResponse } from "@/types/messageResponse";
import { ChatType } from "@/types/enums/ChatType";
import { Avatar } from "./avatar/Avatar";
import classNames from "classnames";

interface MessageReplyPreviewProps {
  message: MessageResponse;
  chatType: ChatType;
  isMe: boolean;
  isSelfReply?: boolean;
  isReplyToMe?: boolean;
}

const MessageReplyPreview: React.FC<MessageReplyPreviewProps> = ({
  message,
  chatType,
  isMe = false,
  isSelfReply = false,
  isReplyToMe = false,
}) => {
  const isNotDirectChat = chatType !== ChatType.DIRECT;

  function scrollToMessage(): void {
    const messageElement = document.getElementById(`message-${message.id}`);
    if (messageElement) {
      // Smooth scroll to the message
      messageElement.scrollIntoView({
        block: "center",
      });

      // Add temporary highlight effect
      messageElement.classList.add("highlight-message");
      setTimeout(() => {
        messageElement.classList.remove("highlight-message");
      }, 2000);
    }
  }

  return (
    <div
      onClick={scrollToMessage}
      className={classNames(
        "message-bubble opacity-60 scale-75 max-w-full inline-block hover:scale-90 hover:opacity-90 transition-transform duration-200",
        {
          "self-message ": isReplyToMe,
          "translate-x-6 ": !isMe && isReplyToMe,
          "-translate-x-6 ": !isSelfReply,
        }
      )}
    >
      <div className={`truncate opacity-80 mb-2`}>
        {message.content || "[media/attachment]"}
      </div>

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
