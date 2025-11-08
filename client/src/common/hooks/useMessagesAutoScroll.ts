import { useEffect, useLayoutEffect, useRef } from "react";
import { scrollToBottom } from "../utils/scrollToBottom";

interface UseAutoScrollParams<T extends HTMLElement = HTMLElement> {
  containerRef: React.RefObject<T | null>; // allow null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  chatId: string;
  isImportantOnly?: boolean;
  threshold?: number;
}

export const useMessagesAutoScroll = <T extends HTMLElement = HTMLElement>({
  containerRef,
  items,
  chatId,
  isImportantOnly,
  threshold = 1000,
}: UseAutoScrollParams<T>) => {
  const prevItemsRef = useRef<{ count: number; firstId?: string }>({
    count: 0,
  });

  // Scroll to bottom when first render
  useLayoutEffect(() => {
    scrollToBottom(containerRef.current);
  }, [chatId, containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prevCount = prevItemsRef.current.count;
    const prevFirstId = prevItemsRef.current.firstId;
    const newCount = items.length;

    const addedToTop = prevFirstId !== undefined && items[0] !== prevFirstId;
    if (addedToTop && prevCount > 0) {
      prevItemsRef.current = { count: newCount, firstId: items[0] };
      return;
    }

    prevItemsRef.current = { count: newCount, firstId: items[0] };

    const nearBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;
    if (nearBottom || prevCount === 0) {
      scrollToBottom(el, "smooth");
    }
  }, [items, isImportantOnly, containerRef, threshold]);
};
