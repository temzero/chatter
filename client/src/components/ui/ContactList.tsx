import React from "react";
import type { Chat } from "@/types/chat";
import { ChatAvatar } from "./ChatAvatar";

interface ChatListProps {
  chats: Chat[];
  isCompact?: boolean;
  isCheckbox?: boolean;
}

const ContactList: React.FC<ChatListProps> = ({
  chats,
  isCompact = false,
}) => {
  function handleContactSelect(chat: Chat) {
    return null;
  }

  const getUserItemClass = (chatId: string) => {
    const baseClasses =
      "relative flex items-center w-full h-22 gap-3 p-3 transition-all duration-300 ease-in-out cursor-pointer";
    const selectedClasses = "hover:bg-[var(--hover-color)]";
    return `${baseClasses} ${selectedClasses}`;
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => {
        return (
          <React.Fragment key={chat.id}>
            <div
              className={getUserItemClass(chat.id)}
              onClick={() => handleContactSelect(chat)}
            >
              <ChatAvatar chat={chat} type="sidebar" />

              {!isCompact && (
                <>
                  <div className="flex flex-col justify-center gap-1">
                    <h1 className="text-lg font-semibold whitespace-nowrap text-ellipsis">
                      {chat.name}
                    </h1>
                  </div>
                </>
              )}
            </div>

            {!isCompact && (
              <div className="w-[90%] mx-auto custom-border-b"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ContactList;
