// hooks/useVirtualKeyboard.ts
import { useEffect, useState } from "react";

export function useVirtualKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      requestAnimationFrame(() => {
        const height = Math.max(0, window.innerHeight - vv.height);
        setKeyboardHeight(height);
      });
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return keyboardHeight;
}
