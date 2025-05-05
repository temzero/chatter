// hooks/useMessages.ts
export const useMessages = (chatId: string) =>
    useQuery({
      queryKey: ["messages", chatId],
      queryFn: async () => {
        const { data } = await axios.get(`/api/chats/${chatId}/messages`);
        return data;
      },
      enabled: !!chatId, // Only fetch when chatId is available
    });
  