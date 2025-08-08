import React from "react";
import { handleReaction } from "@/utils/handleReaction";
import addReactionSound from "@/assets/sound/message-pop.mp3";
import { playSoundEffect } from "@/utils/playSoundEffect";
import { useModalStore } from "@/stores/modalStore";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionPickerProps {
  messageId: string;
  chatId: string;
  isMe?: boolean;
  isChannel?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  chatId,
}) => {
  const closeModal = useModalStore.getState().closeModal;

  return (
    <div
      className={`flex gap-1 rounded-full p-1 blur-card`}
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
            });
            closeModal();
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
