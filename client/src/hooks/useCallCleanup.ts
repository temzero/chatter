// src/lib/hooks/useCallCleanup.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore/callStore";
import { useModalStore } from "@/stores/modalStore";
import { LocalCallStatus } from "@/types/enums/CallStatus";

export const useCallCleanup = () => {
  const callStore = useCallStore();
  const modalStore = useModalStore();

  useEffect(() => {
    const handleCleanup = () => {
      // Only cleanup if there's an active call that hasn't ended
      if (
        callStore.chatId &&
        callStore.localCallStatus &&
        callStore.localCallStatus !== LocalCallStatus.ENDED
      ) {
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
