import React, {
  useState,
  useCallback,
  forwardRef,
  useRef,
  useEffect,
} from "react";

interface InfiniteScrollerProps {
  children: React.ReactNode;
  onLoadMore: () => Promise<number>;
  hasMore: boolean;
  threshold?: number; // px from bottom or top
  loader?: React.ReactNode;
  className?: string;
  isScrollUp?: boolean; // true = load when scroll near top; false = near bottom
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
    const hasAutoLoadedRef = useRef(false);

    const handleScroll = useCallback(
      async (event: React.UIEvent<HTMLDivElement>) => {
        if (!hasMore || isFetchingRef.current) return;

        const el = event.currentTarget;
        let shouldLoad = false;

        if (isScrollUp) {
          shouldLoad = el.scrollTop < threshold;
        //   if (shouldLoad) toast.info("Scrolled near top - loading more...");
        } else {
          shouldLoad =
            el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
        //   if (shouldLoad) toast.info("Scrolled near bottom - loading more...");
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

    useEffect(() => {
      // Delay check to next tick so layout is ready
      const el = containerRef.current;
      if (!el) return;

      if (hasAutoLoadedRef.current) return;

      const checkNoScrollbar = () => {
        const noScroll = el.scrollHeight <= el.clientHeight;
        // console.log("[InfiniteScroller] checkNoScrollbar:", {
        //   scrollHeight: el.scrollHeight,
        //   clientHeight: el.clientHeight,
        //   noScroll,
        // });

        if (hasMore && noScroll) {
          hasAutoLoadedRef.current = true;
        //   toast.info("No scrollbar detected - loading more...");
          isFetchingRef.current = true;
          setIsLoading(true);
          onLoadMore()
            .catch(() => {}) // ignore errors here or handle them
            .finally(() => {
              isFetchingRef.current = false;
              setIsLoading(false);
            });
        }
      };

      // Use requestAnimationFrame or setTimeout for safety
      const id = window.requestAnimationFrame(checkNoScrollbar);

      return () => window.cancelAnimationFrame(id);
    }, [children, hasMore, onLoadMore]);

    return (
      <div
        ref={(el) => {
          containerRef.current = el;
          // assign forwarded ref if provided and it's an object
          if (typeof ref === "function") {
            ref(el);
          } else if (ref && "current" in ref) {
            ref.current = el;
          }
        }}
        onScroll={handleScroll}
        className={`overflow-y-auto overflow-x-hidden h-full ${className}`}
      >
        {isLoading && loader}
        {children}
      </div>
    );
  }
);

export default InfiniteScroller;
