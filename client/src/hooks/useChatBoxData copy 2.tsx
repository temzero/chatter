import { useActiveChatMessages } from "@/stores/messageStore";
import {
  useActiveChat,
} from "@/stores/chatStore";
import { useActiveMembersByChatId } from "@/stores/chatMemberStore";

export const useChatBoxData = () => {
  // console.log("useChatBoxData Rendered");
  const activeChat = useActiveChat();
  const activeChatId = activeChat?.id || "";
  const messages = useActiveChatMessages();
  const chatMembers = useActiveMembersByChatId(activeChatId) || [];
  const isLoading = useIsChatLoading();

  // const isMessageLoading = useMessageLoading()
  // const isChatLoading = useChatStore((state) => state.isLoading);
  // const isLoading = isMessageLoading || isChatLoading;

  console.log("useChatBoxData updated", {
    activeChat,
    messages: messages.length,
    chatMembers: chatMembers.length,
    isLoading,
  });

  return {
    activeChat,
    messages,
    chatMembers,
    isLoading,
  };
};
