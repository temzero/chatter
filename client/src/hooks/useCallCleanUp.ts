// src/lib/hooks/useCallCleanup.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { CallStatus } from "@/types/enums/modalType";

export const useCallCleanup = () => {
  const callStore = useCallStore();

  useEffect(() => {
    const handleCleanup = () => {
      // Only cleanup if there's an active call that hasn't ended
      if (
        callStore.chatId &&
        callStore.callStatus &&
        callStore.callStatus !== CallStatus.ENDED
      ) {
        callWebSocketService.endCall({
          chatId: callStore.chatId,
          // isCallerCancel: true,
        });

        callStore.endCall();
      }
    };

    // ✅ only run when window is closing / refreshing
    window.addEventListener("beforeunload", handleCleanup);

    return () => {
      window.removeEventListener("beforeunload", handleCleanup);
    };
  }, [callStore]);
};
