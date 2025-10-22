import { useEffect } from "react";

type KeyCallback = (event: KeyboardEvent) => void;

interface UseKeyDownOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean; // new option
}

export const useKeyDown = (
  callback: KeyCallback,
  keys: string[] = [],
  options?: UseKeyDownOptions
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check modifier keys
      if (options?.ctrl && !e.ctrlKey) return;
      if (options?.shift && !e.shiftKey) return;
      if (options?.alt && !e.altKey) return;

      // Check keys
      if (keys.length === 0 || keys.includes(e.key)) {
        const shouldPrevent = options?.preventDefault ?? true;
        if (shouldPrevent) e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback, keys, options]);
};
