// components/ui/messages/content/ChannelMessageContent.tsx
import * as React from "react";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import ForwardedMessagePreview from "@/components/ui/messages/ForwardMessagePreview";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { handleQuickReaction } from "@/common/utils/message/quickReaction";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";
import Linkify from "linkify-react";

interface ChannelMessageContentProps {
  message: MessageResponse;
  currentUserId?: string;
  isMe: boolean;
}

const ChannelMessageContent: React.FC<ChannelMessageContentProps> = ({
  message,
  currentUserId,
  isMe,
}) => {
  const attachments = getMessageAttachments(message.chatId, message.id);

  return (
    <>
      <RenderMultipleAttachments
        chatId={message.chatId}
        messageId={message.id}
        attachments={attachments}
      />

      {/* Text content */}
      {message.content && (
        <p
          onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
          className="p-3 wrap-break-word overflow-wrap-break"
          style={{ whiteSpace: "pre-wrap" }}
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

      {/* Forwarded message preview */}
      {message.forwardedFromMessage && (
        <ForwardedMessagePreview
          message={message}
          originalSender={message.forwardedFromMessage?.sender}
          currentUserId={currentUserId ?? undefined}
          isMe={isMe}
        />
      )}
    </>
  );
};

export default ChannelMessageContent;
