import { useCallback, useEffect, useRef } from "react";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";

const useTypingIndicator = (
  inputRef: React.RefObject<HTMLTextAreaElement>,
  chatId: string | null
) => {
  const lastTypingStateRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);
  const previousLengthRef = useRef<number>(0);

  // Send typing state (true/false) over WebSocket
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

  // Manually clear typing state
  const clearTypingState = useCallback(() => {
    if (lastTypingStateRef.current) {
      sendTypingState(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [sendTypingState]);

  useEffect(() => {
    if (!chatId || !inputRef.current) return;

    const handleInput = () => {
      const currentValue = inputRef.current?.value || "";
      const currentLength = currentValue.length;
      const isAddingText = currentLength > previousLengthRef.current;
      previousLengthRef.current = currentLength;

      // Only trigger typing if text was added and there's content
      if (isAddingText && currentValue.trim().length > 0) {
        lastActivityRef.current = Date.now();

        if (!lastTypingStateRef.current) {
          sendTypingState(true);
        }

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          sendTypingState(false);
        }, 5000);
      }
    };

    const element = inputRef.current;
    element.addEventListener("input", handleInput);

    // Initialize previous length
    previousLengthRef.current = element.value.length;

    return () => {
      element.removeEventListener("input", handleInput);
      clearTypingState(); // Clear on unmount
    };
  }, [chatId, inputRef, sendTypingState, clearTypingState]);

  return { clearTypingState };
};

export default useTypingIndicator;
