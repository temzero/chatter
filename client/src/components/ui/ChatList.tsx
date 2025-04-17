import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  type: string;
  isGroup?: boolean;
}

interface ChatListProps {
  chats: Chat[];
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
            {!chat.isGroup ?
              <div className='h-16 w-16 min-w-[4rem] custom-border flex items-center justify-center overflow-hidden rounded-full'>
                {chat.avatar ? (
                  <img 
                    className="h-full w-full object-cover" 
                    src={chat.avatar} 
                    alt={`${chat.name}'s avatar`} 
                  />
                ) : (
                  <i className="material-symbols-outlined text-6xl opacity-20">mood</i>
                )}
              </div>
              :
              <div className='h-16 w-16 min-w-[4rem] custom-border grid grid-cols-2 grid-rows-2 overflow-hidden rounded-lg'>
                <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
                <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
                <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
                <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
              </div>
            }
            
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
                  {chat.time}
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