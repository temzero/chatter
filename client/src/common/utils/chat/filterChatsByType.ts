import { ChatResponse } from "@/shared/types/responses/chat.response";

export const filterChatsByType = (
  chats: ChatResponse[],
  type: string
): ChatResponse[] => {
  if (type === "all") return chats;
  return chats.filter((chat) => chat.type === type);
};
