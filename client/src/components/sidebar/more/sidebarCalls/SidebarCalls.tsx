import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SidebarLayout from "@/layouts/SidebarLayout";
import { callService } from "@/services/http/callService";
import { CallResponse } from "@/shared/types/responses/call.response";
import { getCurrentUserId } from "@/stores/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import InfiniteScroller from "@/components/ui/layout/InfiniteScroller";
import CallItem from "./CallItem";
import logger from "@/common/utils/logger";

const PAGE_LIMIT = 10;

const SidebarCalls: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  const [calls, setCalls] = useState<CallResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastCallId, setLastCallId] = useState<string | null>(null);
  const openModal = getOpenModal();

  // ✅ Load more calls (cursor-based)
  const loadCallData = async (): Promise<number | null> => {
    if (!hasMore) return null;

    try {
      const res = await callService.fetchCallHistory({
        limit: PAGE_LIMIT,
        lastId: lastCallId ?? undefined,
      });
      const newCalls = res.calls;

      // ✅ Merge and ensure unique calls (avoid duplicates if API overlaps)
      setCalls((prev) => {
        const allCalls = [...prev, ...newCalls];
        const uniqueCalls = Array.from(
          new Map(allCalls.map((c) => [c.id, c])).values()
        );
        return uniqueCalls;
      });

      // ✅ Update cursor for next page
      if (newCalls.length > 0) {
        const nextCursor = newCalls[newCalls.length - 1].id;
        setLastCallId(nextCursor);
      }

      setHasMore(res.hasMore);
      return newCalls.length;
    } catch (error) {
      logger.error("Error fetching call history:", error);
      setHasMore(false);
      return 0;
    }
  };

  useEffect(() => {
    setCalls([]);
    setHasMore(true);
    setLastCallId(null);
    loadCallData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]); // run when user changes

  const handleDeleteCall = (call: CallResponse) => {
    openModal(ModalType.DELETE_CALL, {
      call,
      onDeleted: () => setCalls((prev) => prev.filter((c) => c.id !== call.id)),
    });
  };

  return (
    <SidebarLayout title={t("sidebar_calls.title")}>
      <InfiniteScroller
        onLoadMore={() => loadCallData()}
        hasMore={hasMore}
        loader={
          <p className="text-sm text-muted-foreground text-center py-2">
            {t("common.loading.loading")}
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
              <p>{t("sidebar_calls.no_calls")}</p>
            </div>
          ) : (
            calls.map((call) => (
              <motion.div key={call.id} layout='position'>
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
