// utils/handleDoubleClickReaction.ts
import { handleReaction } from "@/utils/handleReaction";
import { audioService, SoundType } from "@/services/audio.service";

export const handleQuickReaction = (
  messageId: string,
  chatId: string,
  emoji?: string
) => {
  audioService.playSound(SoundType.REACTION);
  handleReaction({
    emoji: emoji || "❤️",
    messageId: messageId,
    chatId: chatId,
    onClose: () => {}, // No-op since we're not closing a modal
  });
};
