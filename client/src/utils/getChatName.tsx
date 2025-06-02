import {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
} from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";

const getChatName = (chat: ChatResponse | null | undefined): string => {
  // Handle missing chat object
  if (!chat) return "Unknown chat";

  if (chat.type === ChatType.DIRECT) {
    const directChat = chat as DirectChatResponse;

    // Handle missing chatPartner
    if (!directChat.chatPartner) return "Unknown user";

    // Return nickname if available
    if (directChat.chatPartner.nickname) {
      return directChat.chatPartner.nickname;
    }

    // Build name from first + last name (with fallback to empty string)
    const firstName = directChat.chatPartner.firstName || "";
    const lastName = directChat.chatPartner.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Fallback to username if name is empty
    return fullName || directChat.chatPartner.username || "Unknown user";
  } else {
    const groupChat = chat as GroupChatResponse;
    return groupChat.name || "Unnamed Group";
  }
};

export default getChatName;
