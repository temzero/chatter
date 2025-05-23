import React from "react";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import type { Chat } from "@/types/chat";
import { ChatAvatar } from "./avatar/ChatAvatar";
import { formatTime } from "@/utils/formatTime";

interface ChatListProps {
  chats: Chat[];
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ chats, isCompact = false }) => {
  const activeChat = useChatStore((state) => state.activeChat);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const getDraftMessage = useMessageStore((state) => state.getDraftMessage);

  function handleChatSelect(chat: Chat) {
    window.history.pushState({}, "", `/${chat.id}`);
    setActiveChat(chat);
  }

  const getUserItemClass = (chatId: string) => {
    const baseClasses =
      "relative flex items-center w-full h-24 gap-3 p-3 transition-all duration-300 ease-in-out cursor-pointer";
    const activeClasses =
      activeChat?.id === chatId
        ? "bg-[var(--active-chat-color)]"
        : " hover:bg-[var(--hover-color)]";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => {
        const draft = getDraftMessage(chat.id);
        const displayMessage = draft ? (
          <p className="text-[var(--primary-green)] flex items-center gap-1 overflow-hidden max-w-[196px]">
            <i className="material-symbols-outlined flex items-center justify-center text-[16px] h-3">
              edit
            </i>
            <span className="text-xs whitespace-nowrap text-ellipsis">
              {draft}
            </span>
          </p>
        ) : chat.lastMessage ? (
          <p className="flex items-center opacity-70 gap-1 text-xs max-w-[196px] whitespace-nowrap text-ellipsis overflow-hidden">
            <strong>{chat.lastMessage.senderName}:</strong>{" "}
            {chat.lastMessage.content}
          </p>
        ) : null;

        return (
          <React.Fragment key={chat.id}>
            <div
              className={getUserItemClass(chat.id)}
              onClick={() => handleChatSelect(chat)}
            >
              <ChatAvatar chat={chat} type="sidebar" />

              {!isCompact && (
                <>
                  <div className="flex flex-col justify-center gap-1">
                    <h1 className="text-lg font-semibold whitespace-nowrap text-ellipsis">
                      {chat.name}
                    </h1>
                    {displayMessage}
                  </div>

                  <p className="absolute top-2 right-4 text-xs opacity-40">
                    {formatTime(chat.lastMessage?.createdAt ?? chat.updatedAt)}
                  </p>
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

export default ChatList;
