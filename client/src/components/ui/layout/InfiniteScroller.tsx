import React, { useState, useCallback, forwardRef, useRef } from "react";

interface InfiniteScrollerProps {
  children: React.ReactNode;
  onLoadMore: () => Promise<number | null>;
  hasMore: boolean;
  thresholdPercent?: number;
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
      thresholdPercent = 0.3,
      loader,
      className = "",
      isScrollUp = false,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isFetchingRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleScroll = useCallback(
      async (event: React.UIEvent<HTMLDivElement>) => {
        if (!hasMore || isFetchingRef.current) return;

        const el = event.currentTarget;
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;

        let scrollPercent: number;

        const loadMore = async () => {
          isFetchingRef.current = true;
          setIsLoading(true);
          try {
            await onLoadMore(); // call the passed store function
          } catch (error) {
            console.error("Error loading more items:", error);
            // optionally: handleError(error, "Failed to load more items");
          } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
          }
        };

        if (isScrollUp) {
          scrollPercent = scrollTop / (scrollHeight - clientHeight);
          if (scrollPercent <= thresholdPercent) {
            await loadMore();
          }
        } else {
          scrollPercent = (scrollTop + clientHeight) / scrollHeight;
          if (scrollPercent >= 1 - thresholdPercent) {
            await loadMore();
          }
        }
      },
      [hasMore, isScrollUp, thresholdPercent, onLoadMore]
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
