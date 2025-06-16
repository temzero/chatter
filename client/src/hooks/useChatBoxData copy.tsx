import { useMessageStore } from "@/stores/messageStore";
import { useActiveChat, useChatStore } from "@/stores/chatStore";

export const useChatBoxData = () => {
  console.log("useChatBoxData Rendered");
  const activeChat = useActiveChat();
  const activeChatId = activeChat?.id || "";
  // const messages = useActiveChatMessages();
  // const chatMembers = useActiveMembersByChatId(activeChatId) || [];

  // 2. Get members data (initially empty if not loaded)
  // const { chatMembers, isLoadingMembers } = useChatStore(
  //   useCallback((state) => ({
  //     chatMembers: activeChatId ? get().chatMembers[activeChatId] || [] : [],
  //     isLoadingMembers: state.isLoading,
  //   }), [activeChatId] )
  // );
  const chatMembers = useChatStore.getState().chatMembers[activeChatId] || [];
  const isLoadingMembers = useChatStore((state) => state.isLoading);

  const messages = useMessageStore.getState().messages[activeChatId] || [];
  const isLoadingMessages = useMessageStore((state) => state.isLoading);

  // const { messages, isLoadingMessages } = useMessageStore(
  //   useCallback((state) => ({
  //     messages: activeChatId ? state.messages[activeChatId] || [] : [],
  //     isLoadingMessages: state.isLoading,
  //   }), [activeChatId] )
  // );

  const isLoading = isLoadingMembers || isLoadingMessages;
  console.log("useChatBoxData isLoading:", isLoading);

  // console.log("useChatBoxData activeChat:", activeChat);
  console.log("useChatBoxData messages:", messages);
  console.log("useChatBoxData chatMembers:", chatMembers);

  return {
    activeChat,
    messages,
    chatMembers,
    isLoading,
  };
};
