// import { useMessageStore } from "@/stores/messageStore";
// import { useChatStore } from "@/stores/chatStore";

// // This will only update when chatStore.isLoading or chatStore.activeChat changes
// export const useChatBoxData = () => {
//   const isLoading = useChatStore((state) => state.isLoading);
//   const activeChat = useChatStore((state) => state.activeChat);
//   const activeChatId = activeChat?.id || "";

//   // Only read data if not loading and chat is defined
//   const messages =
//     !isLoading && activeChatId
//       ? useMessageStore.getState().messages[activeChatId] || []
//       : [];

//   const chatMembers =
//     !isLoading && activeChatId
//       ? useChatStore.getState().chatMembers[activeChatId] || []
//       : [];

//   console.log('UseChatBox', {
//     activeChat,
//     messages,
//     chatMembers,
//     isLoading,
//   });

//   return {
//     activeChat,
//     messages,
//     chatMembers,
//     isLoading,
//   };
// };

import { useMessageStore } from "@/stores/messageStore";
import { useChatStore } from "@/stores/chatStore";
import { debounce } from "lodash";
import { useMemo, useState, useEffect } from "react";
import type { ChatResponse } from "@/types/responses/chat.response";
import type { MessageResponse } from "@/types/responses/message.response";
import type { ChatMember } from "@/types/responses/chatMember.response";

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 1200;

export const useChatBoxData = () => {
  const [debouncedData, setDebouncedData] = useState({
    activeChat: null as ChatResponse | null,
    messages: [] as MessageResponse[],
    chatMembers: [] as ChatMember[],
    isLoading: true,
  });
  console.log("useChatBoxData");

  // Get raw store data
  const isLoading = useChatStore((state) => state.isLoading);
  console.log("isLoading from chatStore", isLoading);
  // const activeChat = useChatStore((state) => state.activeChat);
  const activeChat = useChatStore.getState().activeChat;
  const activeChatId = activeChat?.id || "";

  // Debounced update function
  const updateDebouncedData = useMemo(
    () =>
      debounce(() => {
        const messages =
          !isLoading && activeChatId
            ? useMessageStore.getState().messages[activeChatId] || []
            : [];

        const chatMembers =
          !isLoading && activeChatId
            ? useChatStore.getState().chatMembers[activeChatId] || []
            : [];

        setDebouncedData({
          activeChat,
          messages,
          chatMembers,
          isLoading,
        });

        console.log("useChatBoxData updated", {
          activeChat,
          messages: messages.length,
          chatMembers: chatMembers.length,
          isLoading,
        });
      }, DEBOUNCE_DELAY),
    [activeChat, activeChatId, isLoading]
  );

  // Update debounced data when store changes
  useEffect(() => {
    updateDebouncedData();
    // Cleanup debounce on unmount
    return () => updateDebouncedData.cancel();
  }, [updateDebouncedData]);

  return debouncedData;
};
