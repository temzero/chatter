// components/chat/ReactionPicker.tsx
import React from "react";
import { motion } from "framer-motion";
import { useModalStore } from "@/stores/modalStore";
import { handleReaction } from "@/utils/handleReaction";
import classNames from "classnames";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionPickerProps {
  messageId: string;
  chatId: string;
  isMe?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  chatId,
  isMe,
}) => {
  const closeModal = useModalStore.getState().closeModal;

  return (
    <motion.div
      className={classNames(
        "absolute -top-10 bg-[var(--border-color)] custom-border rounded-full shadow-lg p-1 flex gap-1 z-50",
        {
          "right-0": isMe,
          "left-0": !isMe,
        }
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      // exit={{ scale: 0 }}
      style={{
        transformOrigin: isMe ? "bottom right" : "bottom left",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-xl hover:scale-150 transition-transform duration-150"
          onClick={() =>
            handleReaction({
              emoji,
              messageId,
              chatId,
              onClose: closeModal,
            })
          }
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};
