import React from "react";
import type { Chat } from "@/types/chat";
import { ChatAvatar } from "./ChatAvatar";

interface ChatListProps {
  chats: Chat[];
  selectedContacts: string[];
  onContactToggle: (contactId: string) => void;
}

const ContactSelectionList: React.FC<ChatListProps> = ({
  chats,
  selectedContacts,
  onContactToggle,
}) => {
  function getUserItemClass() {
    const baseClasses =
      "relative flex items-center w-full h-22 gap-3 p-3 transition-all duration-300 ease-in-out cursor-pointer";
    const selectedClasses = "hover:bg-[var(--hover-color)]";
    return `${baseClasses} ${selectedClasses}`;
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => {
        return (
          <React.Fragment key={chat.id}>
            <div
              className={getUserItemClass()}
              onClick={() => onContactToggle(chat.id)}
            >
              <ChatAvatar chat={chat} type="sidebar" />

              <div className="flex flex-col justify-center gap-1 flex-1 relative">
                <h1 className="text-lg font-semibold whitespace-nowrap text-ellipsis">
                  {chat.name}
                </h1>
                <input
                  type="checkbox"
                  className="absolute top-1/2 -translate-y-1/2 right-1 h-5 w-5 accent-[var(--primary-green)]"
                  checked={selectedContacts.includes(chat.id)}
                  onClick={() => onContactToggle(chat.id)}
                  onChange={() => onContactToggle(chat.id)}
                />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ContactSelectionList;
