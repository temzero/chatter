import * as React from "react";
import clsx from "clsx";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import ForwardedMessagePreview from "@/components/ui/messages/ForwardMessagePreview";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";
import { handleQuickReaction } from "@/common/utils/message/quickReaction";

interface MessageBubbleProps {
  message: MessageResponse;
  isMe: boolean;
  isRelyToThisMessage?: boolean;
  currentUserId?: string;
}

const MessageContent: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  currentUserId,
}) => {
  const isForwardMessage = message.forwardedFromMessage;
  const attachments = getMessageAttachments(message.chatId, message.id);

  return (
    <>
      {/* Attachments */}
      <RenderMultipleAttachments
        chatId={message.chatId}
        messageId={message.id}
        attachments={attachments}
        className={clsx({
          // "w-[60%] h-[60%]": attachmentLength === 1
        })}
      />

      {/* Text Content */}
      {message.content && !isForwardMessage && (
        <p
          className="wrap-break-word max-w-full cursor-pointer transition-all duration-200 shadow-xl rounded-b-xl"
          onDoubleClick={() =>
            message && handleQuickReaction(message.id, message.chatId)
          }
        >
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
    </>
  );
};

export default MessageContent;
