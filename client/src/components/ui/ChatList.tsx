import React from "react";
import ChatListItem from "./ChatListItem";
import type { ChatResponse } from "@/types/responses/chat.response";
import { useAuthStore } from "@/stores/authStore";

interface ChatListProps {
  chats: ChatResponse[];
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = React.memo(
  ({ chats, isCompact = false }) => {
    console.log("chatList");
    const currentUserId = useAuthStore((state) => state.currentUser?.id || "");

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
