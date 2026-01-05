import React, { useCallback } from "react";
import clsx from "clsx";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";

interface MessagePinnedIconProps {
  chatId: string;
  isMe: boolean;
  className?: string;
  iconClassName?: string;
}

const MessagePinnedIcon: React.FC<MessagePinnedIconProps> = ({
  chatId,
  isMe,
  className = "",
  iconClassName = "",
}) => {
  const handleUnpin = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      chatWebSocketService.togglePinMessage({
        chatId,
        messageId: null, // Passing null to unpin
      });
    },
    [chatId]
  );

  const containerClasses = clsx(
    "absolute top-0 text-red-400 rounded-full cursor-pointer",
    "hover:scale-110 transition-all duration-200",
    "active:scale-95", // Add press feedback
    {
      "-left-5 -rotate-45": isMe,
      "-right-5 rotate-45": !isMe,
    },
    className
  );

  return (
    <div
      className={containerClasses}
      onClick={handleUnpin}
      title="Unpin message" // Accessibility
      role="button"
      tabIndex={0}
    >
      <span className={`material-symbols-outlined filled ${iconClassName}`}>
        keep
      </span>
    </div>
  );
};

export default React.memo(MessagePinnedIcon);
