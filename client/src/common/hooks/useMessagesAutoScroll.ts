import { useEffect, useLayoutEffect, useRef } from "react";
import { scrollToBottom } from "../utils/scrollToBottom";

interface UseAutoScrollParams<T extends HTMLElement = HTMLElement> {
  containerRef: React.RefObject<T | null>;
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
  const prevItemsRef = useRef<{
    firstId?: string;
    lastId?: string;
    count: number;
  }>({
    count: 0,
  });

  // Scroll to bottom on first render or chat change
  useLayoutEffect(() => {
    scrollToBottom(containerRef.current);
  }, [chatId, containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prevCount = prevItemsRef.current.count;
    const prevFirstId = prevItemsRef.current.firstId;
    const prevLastId = prevItemsRef.current.lastId;
    const newCount = items.length;

    // Track first and last IDs
    const firstIdChanged =
      prevFirstId !== undefined && items[0] !== prevFirstId;
    const lastIdChanged =
      prevLastId !== undefined && items[items.length - 1] !== prevLastId;

    // Save current state
    prevItemsRef.current = {
      count: newCount,
      firstId: items[0],
      lastId: items[items.length - 1],
    };

    // If items were added at the top, do not scroll
    if (firstIdChanged && newCount > prevCount) return;

    // If items were removed (count decreased), do not scroll
    if (newCount < prevCount) return;

    // Scroll if near bottom or if new item added at the bottom
    const nearBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;

    if (
      nearBottom ||
      (newCount > prevCount && lastIdChanged) ||
      prevCount === 0
    ) {
      scrollToBottom(el, "smooth");
    }
  }, [items, isImportantOnly, containerRef, threshold]);
};
