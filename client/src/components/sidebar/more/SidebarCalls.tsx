import React, { useState, useCallback } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { callService } from "@/services/callService";
import { getCallText, getCallClass, getCallIcon } from "@/utils/callHelpers";
import { formatDateTime } from "@/utils/formatDate";
import { useCallStore } from "@/stores/callStore/callStore";
import { CallResponseDto } from "@/types/responses/call.response";
import InfiniteScroller from "@/components/ui/InfiniteScroller";

const PAGE_LIMIT = 20;

const SidebarCalls: React.FC = () => {
  const [calls, setCalls] = useState<CallResponseDto[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const startCall = useCallStore((state) => state.startCall);

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

  const handleStartCall = (call: CallResponseDto) => {
    startCall(call.chat.id, call.isVideoCall);
  };

  // Helper to build chat info
  const getChatInfo = (call: CallResponseDto) => {
    const name =
      call.chat.name ||
      call.initiator.nickname ||
      `${call.initiator.firstName} ${call.initiator.lastName}` ||
      "Unknown Chat";

    return {
      id: call.chat.id,
      name,
      avatarUrl: call.chat.avatarUrl || call.initiator.avatarUrl,
      type: call.chat.type,
      myMemberId: call.chat.myMemberId,
    };
  };

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
          calls.map((call) => {
            const chat = getChatInfo(call);
            return (
              <div
                key={call.id}
                className="flex items-center gap-3 p-2 py-3 hover:bg-muted/30 transition custom-border-b select-none"
              >
                <ChatAvatar chat={chat} type="sidebar" />
                <div className="flex-1">
                  <p className="font-medium">{chat.name}</p>
                  <p className="text-sm flex items-center gap-1">
                    <span className={getCallClass(call.status)}>
                      {getCallText(call.status, call.startedAt, call.endedAt)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground opacity-50">
                    {formatDateTime(call.startedAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleStartCall(call)}
                  className="group overflow-hidden relative flex items-center justify-center rounded-full w-12 h-12 text-2xl hover:custom-border hover:bg-[--hover-color]"
                >
                  <span
                    className={`material-symbols-outlined group-hover:hidden ${getCallClass(
                      call.status
                    )}`}
                  >
                    {getCallIcon(call.status)}
                  </span>
                  <div className="hidden group-hover:flex items-center justify-center bg-[--primary-green] w-full h-full">
                    {call.isVideoCall ? (
                      <span className="material-symbols-outlined">
                        videocam
                      </span>
                    ) : (
                      <span className="material-symbols-outlined">phone</span>
                    )}
                  </div>
                </button>
              </div>
            );
          })
        )}
      </InfiniteScroller>
    </SidebarLayout>
  );
};

export default SidebarCalls;
