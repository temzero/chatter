// src/lib/hooks/useCallCleanup.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore";
import { getCloseModal } from "@/stores/modalStore";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { useChatStore } from "@/stores/chatStore";

export const useCleanup = () => {
  // ✅ Only subscribe to the specific actions needed
  const clearChats = useChatStore.getState().clearChats;
  const endCall = useCallStore.getState().endCall;
  const closeModal = getCloseModal();

  useEffect(() => {
    const handleCleanup = () => {
      if (
        useCallStore.getState().chatId &&
        useCallStore.getState().localCallStatus &&
        useCallStore.getState().localCallStatus !== LocalCallStatus.ENDED
      ) {
        endCall();
      }
      closeModal();
      clearChats();
    };

    window.addEventListener("beforeunload", handleCleanup);
    return () => window.removeEventListener("beforeunload", handleCleanup);
  }, [clearChats, endCall, closeModal]);
};
