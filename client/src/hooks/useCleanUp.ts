// src/lib/hooks/useCallCleanup.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { CallStatus } from "@/types/enums/CallStatus";
import { useModalStore } from "@/stores/modalStore";

export const useCleanup = () => {
  const callStore = useCallStore();
  const modalStore = useModalStore();

  useEffect(() => {
    const handleCleanup = () => {
      // Only cleanup if there's an active call that hasn't ended
      if (
        callStore.chatId &&
        callStore.callStatus &&
        callStore.callStatus !== CallStatus.ENDED
      ) {
        callWebSocketService.hangup({
          chatId: callStore.chatId,
          // isCallerCancel: true,
        });

        callStore.endCall();
      }

      modalStore.closeModal();
    };

    // ✅ only run when window is closing / refreshing
    window.addEventListener("beforeunload", handleCleanup);

    return () => {
      window.removeEventListener("beforeunload", handleCleanup);
    };
  }, [callStore, modalStore]);
};
