import React from "react";
import ChatListItem from "./ChatListItem";
import type { ChatResponse } from "@/types/chat";
import { useAuthStore } from "@/stores/authStore";
import { useOnlineStatusListener } from "@/lib/websocket/hooks/useOnlineStatusListener";
import { usePresenceSocketListeners } from "@/lib/websocket/hooks/usePresenceSocketListeners";

interface ChatListProps {
  chats: ChatResponse[];
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = React.memo(
  ({ chats, isCompact = false }) => {
    console.log("chatList");
    const currentUserId = useAuthStore((state) => state.currentUser?.id || "");
    useOnlineStatusListener(chats);

    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isCompact={isCompact}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    );
  }
);

export default React.memo(ChatList);
