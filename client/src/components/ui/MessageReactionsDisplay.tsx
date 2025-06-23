// components/ui/MessageReactionDisplay.tsx
import React from "react";
import classNames from "classnames";

interface MessageReactionDisplayProps {
  reactions: Record<string, string[]>;
  isMe: boolean;
  currentUserId?: string;
}

export const MessageReactionDisplay: React.FC<MessageReactionDisplayProps> = ({
  reactions,
  isMe,
  currentUserId,
}) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  // Convert reactions to array and sort them to put current user's reactions first
  const sortedReactions = Object.entries(reactions).sort((a, b) => {
    const aHasReaction = currentUserId && a[1].includes(currentUserId);
    const bHasReaction = currentUserId && b[1].includes(currentUserId);

    if (aHasReaction && !bHasReaction) return -1;
    if (!aHasReaction && bHasReaction) return 1;
    return 0;
  });

  return (
    <div
      className={classNames(
        "absolute -bottom-3 z-10 flex bg-black/50 rounded-full",
        isMe ? "left-0" : "right-0 flex-row-reverse"
      )}
    >
      {sortedReactions.map(([emoji, userIds]) => {
        // Check if current user has reacted with this emoji
        const hasMyReaction = currentUserId && userIds.includes(currentUserId);
        const othersCount = hasMyReaction ? userIds.length - 1 : userIds.length;

        return (
          <div
            key={emoji}
            className={classNames("text-sm flex items-center", {
              "bg-blue-600/80 rounded-full": hasMyReaction,
            })}
          >
            <span>{emoji}</span>
            {othersCount > 1 && (
              <span className="text-xs ml-0.5">{othersCount}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
