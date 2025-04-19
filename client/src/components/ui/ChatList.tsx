import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ChatProps } from '@/contexts/data';
import { ChatAvatar } from './ChatAvatar';

interface ChatListProps {
  chats: ChatProps[];
  isCompact?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ 
  chats,
  isCompact = false,
}) => {
  const { activeChat, setActiveChat } = useChat();

  const getUserItemClass = (chatId: number) => {
    const baseClasses = "relative flex items-center w-full h-24 gap-3 p-3 transition-all duration-300 ease-in-out cursor-pointer";
    const activeClasses = activeChat?.id === chatId ? "bg-[var(--active-chat-color)]" : " hover:bg-[var(--hover-color)]";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {chats.map((chat) => (
        <React.Fragment key={chat.id}>
          <div className={getUserItemClass(chat.id)} onClick={() => setActiveChat(chat)}>
            <ChatAvatar chat={chat} type='sidebar'/>
            
            {!isCompact && (
              <>
                <div className="flex flex-col justify-center gap-1">
                  <h1 className="text-lg font-semibold whitespace-nowrap text-ellipsis">
                    {chat.name}
                  </h1>
                  <p className="opacity-60 text-xs whitespace-nowrap text-ellipsis overflow-hidden max-w-[196px]">
                    {chat.lastMessage}
                  </p>
                </div>

                <p className="absolute top-2 right-4 text-xs opacity-40">
                  {chat.lastMessageTime}
                </p>
              </>
            )}
          </div>

          {!isCompact && (
            <div className="w-[90%] mx-auto custom-border-b"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ChatList;