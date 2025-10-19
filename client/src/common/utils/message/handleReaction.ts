import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";

export const handleReaction = ({
  emoji,
  messageId,
  chatId,
  onClose,
}: {
  emoji: string;
  messageId: string;
  chatId: string;
  onClose?: () => void;
}) => {
  chatWebSocketService.reactToMessage({
    messageId,
    chatId,
    emoji,
  });

  if (onClose) onClose();
};
