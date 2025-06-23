// components/chat/ReactionPicker.tsx
import React from "react";
import { motion } from "framer-motion";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  position: "left" | "right";
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  position,
}) => {
  return (
    <motion.div
      className={`absolute -bottom-6 ${
        position === "left" ? "left-0" : "right-0"
      } bg-[var(--border-color)] custom-border rounded-full shadow-lg p-1 flex gap-1 z-30`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-xl hover:scale-150 transition-transform duration-150"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};
