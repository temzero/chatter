import { useCallback, useEffect, useRef } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";

type Props = {
  input: string;
  activeChat: { id: string } | null;
};

const useTypingIndicator = ({ input, activeChat }: Props) => {
  const lastTypingStateRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTypingIndicator = useCallback(
    (isUserTyping: boolean) => {
      if (!activeChat?.id) return;

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Only update if the typing state changed
      if (isUserTyping !== lastTypingStateRef.current) {
        chatWebSocketService.typing(activeChat.id, isUserTyping);
        lastTypingStateRef.current = isUserTyping;
      }

      // If user is typing, set a timeout to send false after 3s of inactivity
      if (isUserTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          chatWebSocketService.typing(activeChat.id, false);
          lastTypingStateRef.current = false;
        }, 3000);
      }
    },
    [activeChat?.id]
  );

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const isNonEmpty = input.trim().length > 0;
    handleTypingIndicator(isNonEmpty);
  }, [input, handleTypingIndicator]);
};

export default useTypingIndicator;
