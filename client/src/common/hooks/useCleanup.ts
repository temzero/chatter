// src/lib/hooks/useCallCleanup.ts
import { useEffect } from "react";
import { useCallStore } from "@/stores/callStore";
import { useModalStore } from "@/stores/modalStore";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { useChatStore } from "@/stores/chatStore";

export const useCleanup = () => {
  const callStore = useCallStore();
  const chatStore = useChatStore();
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
      // 🧼 Close any open modals
      modalStore.closeModal();

      // 💬 Clear all chat state
      chatStore.clearChats();
    };

    // ✅ only run when window is closing / refreshing
    window.addEventListener("beforeunload", handleCleanup);

    return () => {
      window.removeEventListener("beforeunload", handleCleanup);
    };
  }, [callStore, chatStore, modalStore]);
};
