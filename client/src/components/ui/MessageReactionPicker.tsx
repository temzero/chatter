// components/chat/ReactionPicker.tsx
import React from "react";
import { motion } from "framer-motion";
import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import { useModalStore } from "@/stores/modalStore";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionPickerProps {
  messageId: string;
  chatId: string;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  chatId,
}) => {
  const closeModal = useModalStore.getState().closeModal;

  const handleReaction = (emoji: string) => {
    chatWebSocketService.reactToMessage({
      messageId,
      chatId,
      emoji,
    });
    close();
    closeModal();
  };

  return (
    <motion.div
      className={`bg-[var(--border-color)] custom-border rounded-full shadow-lg p-1 flex gap-1 z-30`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-xl hover:scale-150 transition-transform duration-150"
          onClick={() => handleReaction(emoji)}
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};
