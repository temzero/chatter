import { useActiveChatMessages } from "@/stores/messageStore";
import { useActiveChat, useIsChatLoading } from "@/stores/chatStore";

export const useChatBoxData = () => {
  console.log("useChatBoxData Rendered");
  const activeChat = useActiveChat();
  const messages = useActiveChatMessages();
  const isLoading = useIsChatLoading();

  // const isMessageLoading = useMessageLoading()
  // const isChatLoading = useChatStore((state) => state.isLoading);
  // const isLoading = isMessageLoading || isChatLoading;

  console.log("useChatBoxData updated", {
    activeChatId: activeChat?.id,
    messagesCount: messages.length,
    isLoading,
  });

  return {
    activeChat,
    messages,
    isLoading,
  };
};
