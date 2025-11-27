// components/ui/messages/content/ChannelMessageContent.tsx
import * as React from "react";
import clsx from "clsx";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import ForwardedMessagePreview from "@/components/ui/messages/ForwardMessagePreview";
import { MessageResponse } from "@/shared/types/responses/message.response";

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
  const attachments = message.attachments ?? [];

  return (
    <>
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="rounded overflow-hidden shadow-lg">
          <RenderMultipleAttachments
            chatId={message.chatId}
            messageId={message.id}
          />
        </div>
      )}

      {/* Text content */}
      {message.content && (
        <p className={clsx("backdrop-blur p-4")}>{message.content}</p>
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
