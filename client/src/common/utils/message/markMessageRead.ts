// src/hooks/chat/useAutoMarkLastMessageRead.ts
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { getCurrentUser } from "@/stores/authStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { MessageResponse } from "@/shared/types/responses/message.response"; // adjust path if needed

interface UseAutoMarkLastMessageReadProps {
  chat: ChatResponse;
  messages: MessageResponse[];
}

/**
 * Automatically sends a "messageRead" event for the latest message
 * if it's from another user and not yet read.
 */
export const MarkLastMessageRead = ({
  chat,
  messages,
}: UseAutoMarkLastMessageReadProps) => {
  const currentUser = getCurrentUser();
  const lastMessage = messages[messages.length - 1];

  if (!chat?.id || !chat?.myMemberId || !lastMessage) return;

  const isFromOther = lastMessage.sender?.id !== currentUser?.id;

  if (isFromOther) {
    const timer = setTimeout(() => {
      chatWebSocketService.messageRead(
        chat.id,
        chat.myMemberId,
        lastMessage.id
      );
    }, 1000);

    return () => clearTimeout(timer);
  }
};
