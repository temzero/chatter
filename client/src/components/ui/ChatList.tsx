import React, { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";
import { webSocketService } from "@/lib/websocket/services/websocket.service";
import { chatGateway } from "@/hooks/useChatOnlineStatus";
import type { ChatResponse } from "@/types/chat";

interface ChatListProps {
  chats: ChatResponse[];
  isCompact?: boolean;
}

// In ChatList.tsx
const ChatList: React.FC<ChatListProps> = ({ chats, isCompact = false }) => {
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const socket = webSocketService.getSocket();

  useEffect(() => {
    if (!socket) return;

    const statusHandler = (payload: { chatId: string; isOnline: boolean }) => {
      setOnlineStatus((prev) => ({
        ...prev,
        [payload.chatId]: payload.isOnline,
      }));
    };

    socket.on(`${chatGateway}:statusChanged`, statusHandler);

    // Fetch initial statuses for all chats
    chats.forEach((chat) => {
      socket.emit(
        `${chatGateway}:getStatus`,
        chat.id,
        (response: { chatId: string; isOnline: boolean }) => {
          setOnlineStatus((prev) => ({
            ...prev,
            [response.chatId]: response.isOnline,
          }));
        }
      );
    });

    return () => {
      socket.off(`${chatGateway}:statusChanged`, statusHandler);
    };
  }, [socket, chats]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isCompact={isCompact}
          isOnline={onlineStatus[chat.id] || false}
        />
      ))}
    </div>
  );
};

// ChatListItem no longer needs useChatOnlineStatus

export default ChatList;
