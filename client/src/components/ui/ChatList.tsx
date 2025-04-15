import React from 'react';

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
  isCompact,
}) => {

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden relative">

          {chats.map((chat) => (
            <React.Fragment key={chat.id}>
              <div className="relative flex items-center w-full h-24 gap-2 p-3 transition-all duration-300 ease-in-out cursor-pointer hover:bg-[var(--hover-color)]">
                <div className="h-16 w-16 min-w-16 custom-border rounded-full flex items-center justify-center overflow-hidden">
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
                
                {!isCompact && (
                  <>
                    <div className="flex justify-center flex-col gap-1">
                      <h1 className="text-lg font-semibold whitespace-nowrap text-ellipsis">
                        {chat.name}
                      </h1>
                      <p className="opacity-60 overflow-hidden text-xs whitespace-nowrap text-ellipsis">
                        {chat.lastMessage}
                      </p>
                    </div>

                    <p className="absolute top-3 right-4 text-xs opacity-40">
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