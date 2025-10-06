import React, { useState, useCallback, forwardRef, useRef } from "react";

interface InfiniteScrollerProps {
  children: React.ReactNode;
  onLoadMore: () => Promise<number | null>;
  hasMore: boolean;
  threshold?: number; // px from bottom or top
  loader?: React.ReactNode;
  className?: string;
  isScrollUp?: boolean;
}

const InfiniteScroller = forwardRef<HTMLDivElement, InfiniteScrollerProps>(
  (
    {
      children,
      onLoadMore,
      hasMore,
      threshold = 100,
      loader,
      className = "",
      isScrollUp = false,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isFetchingRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Scroll handler: only trigger when user scrolls near threshold
    const handleScroll = useCallback(
      async (event: React.UIEvent<HTMLDivElement>) => {
        if (!hasMore || isFetchingRef.current) return;

        const el = event.currentTarget;
        let shouldLoad = false;

        if (isScrollUp) {
          shouldLoad = el.scrollTop < threshold;
        } else {
          shouldLoad =
            el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
        }

        if (shouldLoad) {
          isFetchingRef.current = true;
          setIsLoading(true);

          try {
            await onLoadMore();
          } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
          }
        }
      },
      [hasMore, onLoadMore, threshold, isScrollUp]
    );

    return (
      <div
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref && "current" in ref) ref.current = el;
        }}
        onScroll={handleScroll}
        className={`overflow-y-auto overflow-x-hidden h-full ${className}`}
      >
        {children}
        {isLoading && loader}
      </div>
    );
  }
);

export default InfiniteScroller;
