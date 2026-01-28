import * as React from "react";
import Linkify from "linkify-react";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import ForwardedMessagePreview from "@/components/ui/messages/ForwardMessagePreview";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { handleQuickReaction } from "@/common/utils/message/quickReaction";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";

interface MessageBubbleProps {
  isMe: boolean;
  message: MessageResponse;
  attachments?: AttachmentResponse[];
}

const MessageContent: React.FC<MessageBubbleProps> = ({
  isMe,
  message,
  attachments,
}) => {
  const isForwardMessage = message.forwardedFromMessage;

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
          className="p-2 wrap-break-word overflow-wrap-break"
          onDoubleClick={() =>
            message && handleQuickReaction(message.id, message.chatId)
          }
          style={{ whiteSpace: 'pre-wrap' }}
        >
          <Linkify
            options={{
              target: "_blank",
              rel: "noopener noreferrer",
              className:
                "underline! opacity-70 hover:opacity-100 hover:text-blue-600 italic break-all",
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
          isMe={isMe}
        />
      )}
    </>
  );
};

export default MessageContent;
