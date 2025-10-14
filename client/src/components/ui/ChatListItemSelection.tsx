import React from "react";
import { ChatAvatar } from "./avatar/ChatAvatar";
import type { ChatResponse } from "@/shared/types/responses/chat.response";

interface ChatListItemSelectionProps {
  chat: ChatResponse;
  isSelected: boolean;
  toggleChatSelection: (id: string) => void;
}

const ChatListItemSelection: React.FC<ChatListItemSelectionProps> = ({
  chat,
  isSelected,
  toggleChatSelection,
}) => {
  return (
    <li
      className="flex items-center justify-between p-2 hover:bg-[var(--hover-color)] cursor-pointer"
      onClick={() => toggleChatSelection(chat.id)}
    >
      <div className="flex items-center gap-2">
        <ChatAvatar chat={chat} type="header" />
        <h1 className="truncate font-medium">{chat.name}</h1>
      </div>

      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleChatSelection(chat.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-[var(--border-color)] accent-[var(--primary-green)]"
        />
      </div>
    </li>
  );
};

export default ChatListItemSelection;
