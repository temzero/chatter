import React from "react";
import clsx from "clsx";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import type {
  MessageResponse,
  SenderResponse,
} from "@/shared/types/responses/message.response";

interface ForwardedMessagePreviewProps {
  message?: MessageResponse;
  originalSender?: SenderResponse;
  currentUserId?: string;
  isMe: boolean;
}

const ForwardedMessagePreview: React.FC<ForwardedMessagePreviewProps> = ({
  message,
  originalSender,
  currentUserId,
  isMe,
}) => {
  if (!message) return null;
  const isOriginalFromMe = originalSender?.id === currentUserId;

  const content = message.forwardedFromMessage?.content ?? message.content;
  const attachments =
    message.forwardedFromMessage?.attachments ?? message.attachments;

  return (
    <>
      <div
        style={{ width: "100%", borderRadius: 0 }}
        className={clsx("message-bubble custom-border-b", {
          "self-message": isOriginalFromMe,
        })}
      >
        {attachments && (
          <RenderMultipleAttachments
            chatId={message.chatId}
            messageId={message.id}
            // attachments={attachments}
          />
        )}
        {content && <p className="italic">{content}</p>}
      </div>

      {/* show only if originalSender exists */}
      {originalSender &&
        (isMe ? (
          <div className="opacity-60 text-sm px-2 pb-1 flex items-center justify-between gap-2 bg-black/50">
            <h1>
              {isOriginalFromMe
                ? "from me"
                : `from ${originalSender.displayName}`}
            </h1>
            <span className="material-symbols-outlined -rotate-90">
              arrow_warm_up
            </span>
          </div>
        ) : (
          <div className="opacity-60 text-sm px-2 pb-1 flex items-center justify-between gap-2">
            <span className="material-symbols-outlined rotate-90">
              arrow_warm_up
            </span>
            <h1>
              {isOriginalFromMe
                ? "from Me"
                : `from ${originalSender.displayName}`}
            </h1>
          </div>
        ))}
    </>
  );
};

export default ForwardedMessagePreview;
