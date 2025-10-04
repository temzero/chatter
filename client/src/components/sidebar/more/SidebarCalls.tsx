import React, { useState, useEffect } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { callService } from "@/services/callService";
import { CallResponseDto } from "@/types/responses/call.response";
import InfiniteScroller from "@/components/ui/InfiniteScroller";
import CallItem from "@/components/ui/CallItem";
import { useCurrentUserId } from "@/stores/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { ModalType, useModalStore } from "@/stores/modalStore";

const PAGE_LIMIT = 10;

const SidebarCalls: React.FC = () => {
  const currentUserId = useCurrentUserId();
  const [calls, setCalls] = useState<CallResponseDto[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const openModal = useModalStore((s) => s.openModal);

  console.log("hasMoreCall", hasMore);
  // Load more calls
  const loadCallData = async (): Promise<number> => {
    console.log("loadCallData", "hasMore", hasMore, "offset", offset);
    if (!hasMore) return 0;

    try {
      const res = await callService.fetchCallHistory(PAGE_LIMIT, offset);
      setHasMore(res.hasMore);
      setOffset((prev) => prev + PAGE_LIMIT);
      setCalls((prev) => [...prev, ...res.calls]);
      // setCalls((prev) => {
      //   const allCalls = [...prev, ...res.calls];
      //   const uniqueCalls = Array.from(
      //     new Map(allCalls.map((c) => [c.id, c])).values()
      //   );
      //   return uniqueCalls;
      // });
      return res.calls.length;
    } catch {
      setHasMore(false);
      return 0;
    }
  };
  console.log("calls", calls);

  useEffect(() => {
    loadCallData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]); // empty dependency array ensures it runs only once

  const handleDeleteCall = (call: CallResponseDto) => {
    openModal(ModalType.DELETE_CALL, {
      call,
      onDeleted: () => setCalls((prev) => prev.filter((c) => c.id !== call.id)),
    });
  };

  return (
    <SidebarLayout title="Call History">
      <InfiniteScroller
        onLoadMore={() => loadCallData()}
        hasMore={hasMore}
        loader={
          <p className="text-sm text-muted-foreground text-center py-2">
            Loading...
          </p>
        }
        className="max-h-[calc(100vh-64px)]"
      >
        <AnimatePresence initial={false}>
          {calls.length === 0 && !hasMore ? (
            <div className="flex flex-col items-center justify-center mt-8 opacity-60">
              <i className="material-symbols-outlined text-6xl mb-4 scale-x-[-1]">
                phone_enabled
              </i>
              <p>No Call Yet!</p>
            </div>
          ) : (
            calls.map((call) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                layout
              >
                <CallItem
                  call={call}
                  isCaller={call.initiator.userId === currentUserId}
                  onDelete={() => handleDeleteCall(call)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </InfiniteScroller>
    </SidebarLayout>
  );
};

export default SidebarCalls;
