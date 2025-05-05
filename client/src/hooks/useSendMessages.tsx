// hooks/useSendMessage.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: MessageProps) =>
      await axios.post("/api/messages", message),
    onSuccess: (_, newMessage) => {
      queryClient.invalidateQueries(["messages", newMessage.chatId]);
      queryClient.invalidateQueries(["chats"]);
    },
  });
};
