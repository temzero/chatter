import * as React from "react";
import clsx from "clsx";
import RenderMultipleAttachments from "@/components/ui/attachments/RenderMultipleAttachments";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  if (!message) return null;
  const isOriginalFromMe = originalSender?.id === currentUserId;

  const content = message.forwardedFromMessage?.content ?? message.content;
  const attachments = message.attachments;

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
                ? t("common.messages.from_you")
                : t("common.messages.from_user", {
                    name: originalSender.displayName,
                  })}
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
                ? t("forwarded.from_you")
                : t("forwarded.from_user", {
                    name: originalSender.displayName,
                  })}
            </h1>
          </div>
        ))}
    </>
  );
};

export default ForwardedMessagePreview;
