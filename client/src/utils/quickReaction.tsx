// utils/handleDoubleClickReaction.ts
import { handleReaction } from "@/utils/handleReaction";
import { playSound } from "@/utils/playSound";
import addReactionSound from "@/assets/sound/message-pop.mp3";

export const handleQuickReaction = (
  messageId: string,
  chatId: string,
  emoji?: string
) => {
  playSound(addReactionSound, 1);
  handleReaction({
    emoji: emoji || "❤️",
    messageId: messageId,
    chatId: chatId,
    onClose: () => {}, // No-op since we're not closing a modal
  });
};
