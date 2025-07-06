// hooks/useViewportCollision.ts
import { useState, useEffect } from "react";

export const useViewportCollision = <T extends HTMLElement>(
  messageRef: React.RefObject<T | null> // Add | null here if needed
) => {
  const [isNearTop, setIsNearTop] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isNearLeft, setIsNearLeft] = useState(false);
  const [isNearRight, setIsNearRight] = useState(false);

  useEffect(() => {
    const checkPosition = () => {
      if (messageRef.current) {
        const rect = messageRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        setIsNearTop(rect.top < 150);
        setIsNearBottom(rect.bottom > viewportHeight - 150);
        setIsNearLeft(rect.left < 150);
        setIsNearRight(rect.right > viewportWidth - 150);
      }
    };

    checkPosition();
    window.addEventListener("resize", checkPosition);

    return () => window.removeEventListener("resize", checkPosition);
  }, [messageRef]);

  return { isNearTop, isNearBottom, isNearLeft, isNearRight };
};
