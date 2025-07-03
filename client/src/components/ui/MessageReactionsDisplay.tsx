// components/ui/MessageReactionDisplay.tsx
import React from "react";
import classNames from "classnames";
import { handleReaction } from "@/utils/handleReaction";

interface MessageReactionDisplayProps {
  reactions: Record<string, string[]>;
  isMe: boolean;
  currentUserId?: string;
  messageId: string;
  chatId: string;
}

export const MessageReactionDisplay: React.FC<MessageReactionDisplayProps> = ({
  reactions,
  isMe,
  currentUserId,
  messageId,
  chatId,
}) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  // Sort reactions to show current user's reactions first
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
        const hasMyReaction = currentUserId && userIds.includes(currentUserId);
        const othersCount = hasMyReaction ? userIds.length - 1 : userIds.length;

        return (
          <button
            key={emoji}
            className={classNames(
              "text-sm flex items-center px-1 py-0.5 cursor-pointer",
              {
                "bg-blue-600/80 rounded-full": hasMyReaction,
              }
            )}
            onClick={() =>
              handleReaction({
                emoji,
                messageId,
                chatId,
              })
            }
          >
            <span>{emoji}</span>
            {othersCount > 1 && (
              <span className="text-xs ml-0.5">{othersCount}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
