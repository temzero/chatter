import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat/directChatService";

export const useChats = () => {
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: () => chatService.getAllChats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createChatMutation = useMutation({
    mutationFn: chatService.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return {
    chats: chatsQuery.data,
    isLoading: chatsQuery.isLoading,
    error: chatsQuery.error,
    createChat: createChatMutation.mutateAsync,
  };
};
