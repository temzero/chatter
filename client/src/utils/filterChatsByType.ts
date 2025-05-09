import { Chat } from "@/types/chat";

export const filterChatsByType = (
  chats: Chat[],
  type: string
): Chat[] => {
  if (type === "all") return chats

  console.log(chats.map(chat => chat.type));
  return chats.filter((chat) => chat.type === type);
};
