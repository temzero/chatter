// components/ui/ForwardedMessagePreview.tsx
import React from "react";
import clsx from "clsx";
import type { MessageResponse } from "@/types/responses/message.response";

interface ForwardedMessagePreviewProps {
  message?: MessageResponse;
  currentUserId?: string;
  isMe: boolean;
}

const ForwardedMessagePreview: React.FC<ForwardedMessagePreviewProps> = ({
  message,
  currentUserId,
  isMe,
}) => {
  if (!message) return null;
  const isFromMe = message.sender.id === currentUserId;

  return (
    <>
      <div
        style={{ width: "100%" }}
        className={clsx("message-bubble custom-border", {
          "self-message": isFromMe,
        })}
      >
        {message.content && <p className="italic">{message.content}</p>}
      </div>
      {/* reverse this when isMe */}

      {isMe ? (
        <div className="opacity-60 text-sm px-2 pb-1 flex items-center justify-between gap-2">
          <h1>{isFromMe ? "from Me" : `from ${message.sender.displayName}`}</h1>
          <span className="material-symbols-outlined -rotate-90">
            arrow_warm_up
          </span>
        </div>
      ) : (
        <div className="opacity-60 text-sm px-2 pb-1 flex items-center justify-between gap-2">
          <span className="material-symbols-outlined rotate-90">
            arrow_warm_up
          </span>
          <h1>{isFromMe ? "from Me" : `from ${message.sender.displayName}`}</h1>
        </div>
      )}
    </>
  );
};

export default ForwardedMessagePreview;