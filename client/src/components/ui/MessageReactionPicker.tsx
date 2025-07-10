import React from "react";
import { motion } from "framer-motion";
import { handleReaction } from "@/utils/handleReaction";
import addReactionSound from "@/assets/sound/message-pop.mp3";
import { playSoundEffect } from "@/utils/playSoundEffect";
import clsx from "clsx";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionPickerProps {
  messageId: string;
  chatId: string;
  isMe?: boolean;
  onClose?: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  chatId,
  isMe,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        transformOrigin: isMe ? "bottom right" : "bottom left",
      }}
      className={clsx(
        "absolute -top-11 flex gap-1 rounded-full p-1 blur-card z-50",
        {
          "right-0": isMe,
          "left-0": !isMe,
          // "-top-11": !flip, // Default position below
          // "-bottom-11 ": flip, // Flipped position above
        }
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-xl hover:scale-150 transition-transform duration-150"
          onClick={() => {
            playSoundEffect(addReactionSound, 1);
            handleReaction({
              emoji,
              messageId,
              chatId,
              onClose,
            });
          }}
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};
