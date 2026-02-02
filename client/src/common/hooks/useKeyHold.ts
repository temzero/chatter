// Create a new hook file or add this in your component
import { useEffect, useRef } from "react";

export const useKeyHold = (
  key: string,
  onHoldStart: () => void,
  onHoldEnd: () => void,
) => {
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const keyDownTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === key && !isHoldingRef.current) {
        isHoldingRef.current = true;
        keyDownTimeRef.current = Date.now();

        holdTimerRef.current = setTimeout(() => {
          onHoldStart();
        }, 300); // 300ms hold threshold
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === key) {
        isHoldingRef.current = false;

        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        // If key was held for more than 50ms, trigger hold end
        if (Date.now() - keyDownTimeRef.current > 50) {
          onHoldEnd();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, [key, onHoldStart, onHoldEnd]);
};
