import { useCallback, useEffect, useMemo } from "react";
import { useActiveChat, useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { ChatType } from "@/types/enums/ChatType";

export const useChatBoxData = () => {
  const activeChat = useActiveChat();
  const chatId = activeChat?.id || "";
  console.log("useChatBoxData activeChatId:", chatId);

  // 2. Get members data (initially empty if not loaded)
  const { chatMembers, getChatMembers, isLoadingMembers } = useChatStore(
    useCallback(
      (state) => ({
        chatMembers: chatId ? state.chatMembers[chatId] || [] : [],
        getChatMembers: state.getChatMembers,
        isLoadingMembers: state.isLoading,
      }),
      [chatId]
    )
  );

  // 3. Get messages data
  const { messages, isLoadingMessages, fetchMessages } = useMessageStore(
    useCallback(
      (state) => ({
        messages: chatId ? state.messages[chatId] || [] : [],
        isLoadingMessages: state.isLoading,
        fetchMessages: state.fetchMessages,
      }),
      [chatId]
    )
  );

  // 4. Fetch chat data and messages when chatId changes
  useEffect(() => {
    if (chatId) {
      // Always fetch messages for the chat
      const fetchedMessages = fetchMessages(chatId);
      console.log("Fetched messages:", fetchedMessages);

      // Fetch members if it's a group/channel chat
      if (activeChat?.type !== ChatType.DIRECT && !chatMembers?.length) {
        const fetchedChatMembers = getChatMembers(chatId);
        console.log("Fetched chat members:", fetchedChatMembers);
      }
    }
  }, [
    chatId,
    activeChat?.type,
    chatMembers,
    activeChat,
    fetchMessages,
    getChatMembers,
  ]);

  // 5. Calculate loading state
  const isLoading = useMemo(
    () => isLoadingMembers || isLoadingMessages,
    [isLoadingMembers, isLoadingMessages]
  );

  console.log("useChatBoxData returning data", {
    activeChat,
    messages,
    chatMembers,
    isLoading,
  });

  return {
    activeChat,
    messages,
    chatMembers,
    isLoading,
  };
};
