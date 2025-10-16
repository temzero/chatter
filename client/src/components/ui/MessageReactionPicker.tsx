import React from "react";
import { handleReaction } from "@/common/utils/handleReaction";
import { audioService, SoundType } from "@/services/audio.service";
import { useModalStore } from "@/stores/modalStore";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥", "💯"];

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
      className={`flex gap-1 rounded-full p-1 bg-[--sidebar-color] custom-border`}
      onClick={(e) => e.stopPropagation()}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          className="text-xl hover:scale-150 transition-transform duration-150"
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
        </button>
      ))}
    </div>
  );
};
