import * as React from "react";
import { motion } from "framer-motion";
import { handleReaction } from "@/common/utils/message/handleReaction";
import { audioService, SoundType } from "@/services/audioService";
import { getCloseModal } from "@/stores/modalStore";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥", "💯"];

interface ReactionPickerProps {
  messageId: string;
  chatId: string;
  isMe?: boolean;
  isChannel?: boolean;
}

export const MessageReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  chatId,
}) => {
  const closeModal = getCloseModal();

  return (
    <div
      className="flex gap-1 rounded-full! p-1 bg-(--sidebar-color) custom-border"
      onClick={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 2 }}
          whileHover={{ scale: 1.5 }}
          className="text-xl"
          onClick={() => {
            audioService.playSound(SoundType.REACTION);
            handleReaction({
              emoji,
              messageId,
              chatId,
            });
            closeModal();
          }}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
};
