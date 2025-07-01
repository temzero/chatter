import { Chat } from "@/types/responses/chat.response";

export const filterChatsByType = (chats: Chat[], type: string): Chat[] => {
  if (type === "all") return chats;
  return chats.filter((chat) => chat.type === type);
};
