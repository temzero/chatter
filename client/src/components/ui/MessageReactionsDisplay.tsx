// components/ui/MessageReactionDisplay.tsx
import React from "react";
import classNames from "classnames";

interface MessageReactionDisplayProps {
  reactions: Record<string, string[]>;
  isMe: boolean;
}

export const MessageReactionDisplay: React.FC<MessageReactionDisplayProps> = ({
  reactions,
  isMe,
}) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div
      className={classNames(
        "absolute bottom-1 flex flex-wrap",
        isMe ? "left-0" : "right-0"
      )}
    >
      {Object.entries(reactions).map(([emoji, userIds]) => (
        <div
          key={emoji}
          className="text-sm flex items-center"
        >
          <span>{emoji}</span>
          {userIds.length > 1 && (
            <span className="text-xs">{userIds.length}</span>
          )}
        </div>
      ))}
    </div>
  );
};
