import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { messageService } from "@/services/messageService";

export const useMessages = (chatId: string) => {
  const queryClient = useQueryClient();

  const messagesQuery = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: ({ pageParam = 1 }) =>
      messageService.getMessages(chatId, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 50) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const sendMessageMutation = useMutation({
    mutationFn: messageService.sendMessage,
    onSuccess: (newMessage) => {
      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        if (!oldData) return { pages: [[newMessage]], pageParams: [1] };
        return {
          ...oldData,
          pages: [[newMessage, ...oldData.pages[0]], ...oldData.pages.slice(1)],
        };
      });
    },
  });

  return {
    messages: messagesQuery.data?.pages.flat() || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    fetchNextPage: messagesQuery.fetchNextPage,
    hasNextPage: messagesQuery.hasNextPage,
    sendMessage: sendMessageMutation.mutateAsync,
  };
};
