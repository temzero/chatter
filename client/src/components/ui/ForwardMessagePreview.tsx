// components/ui/ForwardedMessagePreview.tsx
import React from "react";
import classNames from "classnames";
import type { MessageResponse } from "@/types/responses/message.response";
import { useCurrentUser } from "@/stores/authStore";

interface ForwardedMessagePreviewProps {
  message: MessageResponse;
  isMe: boolean;
}

const ForwardedMessagePreview: React.FC<ForwardedMessagePreviewProps> = ({
  message,
  isMe,
}) => {
  const currentUser = useCurrentUser();
  const isFromMe = message.sender.id === currentUser?.id;

  return (
    <>
      <div
        className={classNames("p-2 rounded-lg custom-border shadow-xl", {
          "bg-[var(--active-chat-color)]": isFromMe,
          "bg-[var(--message-color)] ": !isFromMe,
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
