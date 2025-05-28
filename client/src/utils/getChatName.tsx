import {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
} from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";

const getChatName = (chat: ChatResponse): string => {
  if (chat.type === ChatType.DIRECT) {
    const directChat = chat as DirectChatResponse;
    return (
      directChat.chatPartner.nickname ??
      `${directChat.chatPartner.firstName} ${directChat.chatPartner.lastName}`
    );
  } else {
    const groupChat = chat as GroupChatResponse;
    return groupChat.name || "Unnamed Group";
  }
};

export default getChatName;
