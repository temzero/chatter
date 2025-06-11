import React from "react";
import ChatListItem from "./ChatListItem";
import type { ChatResponse } from "@/types/chat";
import { useChatsOnlineStatus } from "@/hooks/useChatsOnlineStatus";

interface ChatListProps {
  chats: ChatResponse[];
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ chats, isCompact = false }) => {
  const onlineChatsStatus = useChatsOnlineStatus(chats);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isCompact={isCompact}
          isOnline={onlineChatsStatus[chat.id] || false}
        />
      ))}
    </div>
  );
};

export default ChatList;
