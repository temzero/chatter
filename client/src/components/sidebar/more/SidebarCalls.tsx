import React, { useEffect, useState } from "react";
import SidebarLayout from "@/pages/SidebarLayout";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { callService } from "@/services/callService";
// import { CallActionResponse } from "@/types/callPayload";
import { getCallText, getCallClass, getCallIcon } from "@/utils/callHelpers";
import { formatDateTime } from "@/utils/formatDate";
import { ChatType } from "@/types/enums/ChatType";
import { useCallStore } from "@/stores/callStore/callStore";
import { CallResponseDto } from "@/types/responses/call.response";

const SidebarCalls: React.FC = () => {
  const [calls, setCalls] = useState<CallResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const startCall = useCallStore((state) => state.startCall);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await callService.getCallHistory();
        console.log("Fetched call history:", res);
        setCalls(res); // ✅ already matches CallHistoryResponse[]
      } catch (err) {
        console.error("Failed to fetch call history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, []);

  function handleStartCall(call: CallResponseDto) {
    console.log("Starting call with", call);
    startCall(call.chat.id, {
      isVideoCall: call.isVideoCall,
      isGroupCall: call.isGroupCall,
    });
  }

  return (
    <SidebarLayout title="Call History">
      <div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8 opacity-60">
            <i className="material-symbols-outlined text-6xl mb-4 scale-x-[-1]">
              phone_enabled
            </i>
            <p>No Call Yet!</p>
          </div>
        ) : (
          calls.map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-3 p-2 py-3 hover:bg-muted/30 transition custom-border-b select-none"
            >
              {/* 🔹 Chat Avatar (from normalized fields) */}
              <ChatAvatar
                chat={{
                  id: call.chat.id,
                  name: call.chat.name,
                  avatarUrl: call.chat.avatarUrl,
                  type: call.isGroupCall ? ChatType.GROUP : ChatType.DIRECT,
                  myMemberId: call.chat.myMemberId,
                }}
                type="sidebar"
              />

              {/* 🔹 Info */}
              <div className="flex-1">
                <p className="font-medium">
                  {call.chat.name ?? "Unknown Chat"}
                </p>
                <p className="text-sm flex items-center gap-1">
                  <span className={getCallClass(call)}>
                    {getCallText(call)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground opacity-50">
                  {formatDateTime(call.startedAt)}
                </p>
              </div>

              {/* 🔹 Action Button */}
              <button
                onClick={() => handleStartCall(call)}
                className={`group overflow-hidden relative flex items-center justify-center rounded-full w-12 h-12 text-2xl hover:custom-border hover:bg-[--hover-color]`}
              >
                {/* Default icon */}
                <span
                  className={`material-symbols-outlined group-hover:hidden ${getCallClass(
                    call
                  )}`}
                >
                  {getCallIcon(call)}
                </span>

                {/* Hover content */}
                <div className="hidden group-hover:flex items-center justify-center bg-[--primary-green] w-full h-full">
                  {call.isVideoCall ? (
                    <span className="material-symbols-outlined">videocam</span>
                  ) : (
                    <span className="material-symbols-outlined">phone</span>
                  )}
                </div>
              </button>
            </div>
          ))
        )}
      </div>
    </SidebarLayout>
  );
};

export default SidebarCalls;
