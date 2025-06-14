import { useCallback, useEffect, useRef } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";

const useTypingIndicator = (
  inputRef: React.RefObject<HTMLTextAreaElement>,
  chatId: string | null
) => {
  const lastTypingStateRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);

  const sendTypingState = useCallback(
    (isTyping: boolean) => {
      if (!chatId) return;

      if (isTyping !== lastTypingStateRef.current) {
        chatWebSocketService.typing(chatId, isTyping);
        lastTypingStateRef.current = isTyping;
      }
    },
    [chatId]
  );

  useEffect(() => {
    if (!chatId || !inputRef.current) return;

    const handleActivity = () => {
      const hasValue = inputRef.current?.value.trim().length > 0;
      lastActivityRef.current = Date.now();

      // Only send typing=true if we're not already in typing state
      if (!lastTypingStateRef.current && hasValue) {
        sendTypingState(true);
      }

      // Reset the timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTypingState(false);
      }, 5000);
    };

    const element = inputRef.current;

    // Track both input and keydown events for better accuracy
    element.addEventListener("input", handleActivity);
    element.addEventListener("keydown", handleActivity);

    // Cleanup function
    return () => {
      element.removeEventListener("input", handleActivity);
      element.removeEventListener("keydown", handleActivity);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (lastTypingStateRef.current) {
        sendTypingState(false);
      }
    };
  }, [chatId, inputRef, sendTypingState]);
};

export default useTypingIndicator;
