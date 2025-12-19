// utils/handleDoubleClickReaction.ts
import { handleReaction } from "@/common/utils/message/handleReaction";
import { audioManager, SoundType } from "@/services/audioManager";

export const handleQuickReaction = (
  messageId: string,
  chatId: string,
  emoji?: string
) => {
  audioManager.playSound(SoundType.REACTION);
  handleReaction({
    emoji: emoji || "❤️",
    messageId: messageId,
    chatId: chatId,
    onClose: () => {}, // No-op since we're not closing a modal
  });
};
