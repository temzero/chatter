import React from "react";
import clsx from "clsx";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import ForwardedMessagePreview from "@/components/ui/messages/ForwardMessagePreview";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
// import { useMessageAttachments } from "@/stores/messageAttachmentStore";

interface MessageBubbleProps {
  message: MessageResponse;
  isMe: boolean;
  isRelyToThisMessage?: boolean;
  currentUserId?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  isRelyToThisMessage,
  currentUserId,
}) => {
  // const attachments = useMessageAttachments(message.chatId, message.id);
  const isForwardMessage = message.forwardedFromMessage;

  return (
    <div
      className={clsx("message-bubble", {
        "border-4 border-red-500/80": message.isImportant,
        "self-message ml-auto": isMe,
        "message-bubble-reply": isRelyToThisMessage,
        "opacity-60": message.status === MessageStatus.SENDING,
        "opacity-60 border-2 border-red-500":
          message.status === MessageStatus.FAILED,
        "opacity-100": !message.status || message.status === MessageStatus.SENT,
      })}
      // style={{
      //   width:
      //     attachments.length === 1
      //       ? "var(--attachment-width)"
      //       : attachments.length > 1
      //       ? "var(--attachment-width-large)"
      //       : undefined,
      // }}
    >
      {/* Attachments */}
      <RenderMultipleAttachments
        chatId={message.chatId}
        messageId={message.id}
      />

      {/* Text Content */}
      {message.content && !isForwardMessage && (
        <p className="break-words max-w-full cursor-pointer transition-all duration-200 shadow-xl rounded-b-xl">
          {message.content}
        </p>
      )}

      {/* Forwarded Message */}
      {isForwardMessage && (
        <ForwardedMessagePreview
          message={message}
          originalSender={message.forwardedFromMessage?.sender}
          currentUserId={currentUserId}
          isMe={isMe}
        />
      )}
    </div>
  );
};

export default MessageBubble;
