import React from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { handleReaction } from "@/common/utils/message/handleReaction";
import { useMessageReactions } from "@/stores/messageStore";
import { audioService, SoundType } from "@/services/audio.service";
import { messageAnimations } from "@/common/animations/messageAnimations";

interface MessageReactionDisplayProps {
  isMe?: boolean;
  isChannel?: boolean;
  isSystemMessage?: boolean;
  currentUserId?: string;
  messageId: string;
  chatId: string;
}

export const MessageReactionDisplay: React.FC<MessageReactionDisplayProps> = ({
  isMe = false,
  isChannel = false,
  isSystemMessage = false,
  currentUserId,
  messageId,
  chatId,
}) => {
  const reactions = useMessageReactions(messageId);

  if (!reactions || Object.keys(reactions).length === 0) return null;

  const sortedReactions = Object.entries(reactions).sort((a, b) => {
    const aHasReaction = currentUserId && a[1].includes(currentUserId);
    const bHasReaction = currentUserId && b[1].includes(currentUserId);
    return aHasReaction && !bHasReaction
      ? -1
      : !aHasReaction && bHasReaction
      ? 1
      : 0;
  });

  const handleClick = (emoji: string) => {
    const hasMyReaction =
      currentUserId && reactions[emoji]?.includes(currentUserId);

    if (hasMyReaction) {
      audioService.playSound(SoundType.REACTION_REMOVE);
    } else {
      audioService.playSound(SoundType.REACTION);
    }

    handleReaction({
      emoji,
      messageId,
      chatId,
    });
  };

  return (
    <motion.div
      className={clsx(
        "message-reaction absolute flex bg-black/50 rounded-full",
        isChannel
          ? "left-2 -bottom-3"
          : isMe && !isSystemMessage
          ? "-left-2 -bottom-3"
          : "-right-2 -bottom-3 flex-row-reverse"
      )}
      style={{ zIndex: 1 }}
      {...messageAnimations.reaction}
    >
      <AnimatePresence initial={false}>
        {sortedReactions.map(([emoji, userIds]) => {
          const hasMyReaction =
            currentUserId && userIds.includes(currentUserId);
          return (
            <motion.button
              key={emoji}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 28,
              }}
              className={clsx(
                "text-sm flex items-center p-0.5 cursor-pointer",
                {
                  "bg-blue-600/80 rounded-full": hasMyReaction,
                }
              )}
              onClick={() => handleClick(emoji)}
            >
              <span>{emoji}</span>
              {userIds.length > 1 && (
                <span className="text-xs ml-0.5">{userIds.length}</span>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
