import * as React from "react";
import Linkify from "linkify-react";
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
      />

      {/* Text Content */}
      {message.content && !isForwardMessage && (
        <p
          className="wrap-break-word max-w-full cursor-pointer transition-all duration-200 shadow-xl rounded-b-xl"
          onDoubleClick={() =>
            message && handleQuickReaction(message.id, message.chatId)
          }
        >
          <Linkify
            options={{
              target: "_blank",
              rel: "noopener noreferrer",
              className: "underline! opacity-70 hover:opacity-100 hover:text-blue-600 italic break-all",
              attributes: {
                onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
                  e.stopPropagation(),
              },
            }}
          >
            {message.content}
          </Linkify>
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
