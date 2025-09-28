import React, { useState, useCallback } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { callService } from "@/services/callService";
import { CallResponseDto } from "@/types/responses/call.response";
import InfiniteScroller from "@/components/ui/InfiniteScroller";
import CallItem from "@/components/ui/CallItem";

const PAGE_LIMIT = 20;

const SidebarCalls: React.FC = () => {
  const [calls, setCalls] = useState<CallResponseDto[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  // const isActive = useIsActiveChat(chat.id);

  // Load more calls
  const loadMoreCalls = useCallback(async (): Promise<number> => {
    if (!hasMore) return 0;

    try {
      const res = await callService.fetchCallHistory(PAGE_LIMIT, offset);
      setCalls((prev) => [...prev, ...res.calls]);
      setHasMore(res.hasMore);
      setOffset((prev) => prev + PAGE_LIMIT);
      return res.calls.length;
    } catch {
      return 0;
    }
  }, [offset, hasMore]);

  return (
    <SidebarLayout title="Call History">
      <InfiniteScroller
        onLoadMore={loadMoreCalls}
        hasMore={hasMore}
        loader={
          <p className="text-sm text-muted-foreground text-center py-2">
            Loading...
          </p>
        }
        className="max-h-[calc(100vh-64px)]"
      >
        {calls.length === 0 && !hasMore ? (
          <div className="flex flex-col items-center justify-center mt-8 opacity-60">
            <i className="material-symbols-outlined text-6xl mb-4 scale-x-[-1]">
              phone_enabled
            </i>
            <p>No Call Yet!</p>
          </div>
        ) : (
          calls.map((call) => <CallItem key={call.id} call={call} />)
        )}
      </InfiniteScroller>
    </SidebarLayout>
  );
};

export default SidebarCalls;
