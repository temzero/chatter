import React from 'react';
import { useChat } from '@/contexts/ChatContext';

interface ChatRoomProps {
  id: string;
  name?: string;
  type: 'private' | 'group';
  avatar?: string;
  lastMessage?: string;
  lastMessageTimestamp?: Date;
  members?: string[];
}

interface ChatRoomsProps {
  chatRooms: Record<string, ChatRoomProps>;  // Changed to an object for faster lookup
  isCompact?: boolean;
}

const ChatRooms: React.FC<ChatRoomsProps> = ({ 
  chatRooms = {},
  isCompact = false,
}) => {
  const { activeRoom, setActiveRoom } = useChat();

  const getChatItemClass = React.useCallback((chatId: string) => {
    const baseClass = "relative flex items-center w-full gap-3 p-3 transition-all duration-300 ease-in-out cursor-pointer";
    const heightClass = isCompact ? " h-16" : " h-24";
    const activeClass = activeRoom?.id === chatId
      ? " bg-[var(--active-chat-color)]"
      : " hover:bg-[var(--hover-color)]";
    
    return `${baseClass}${heightClass}${activeClass}`;
  }, [isCompact, activeRoom?.id]);

  const formatTime = React.useCallback((date?: Date) => {
    if (!date) return '';
    try {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Invalid date format", e);
      return '';
    }
  }, []);

  const chatRoomEntries = Object.values(chatRooms); // Convert object to array for mapping

  if (!chatRoomEntries.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 opacity-70">No chats available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {chatRoomEntries.map((chat) => {
        if (!chat?.id) {
          console.warn("Chat room missing ID", chat);
          return null;
        }

        return (
          <React.Fragment key={chat.id}>
            <div 
              className={getChatItemClass(chat.id)} 
              onClick={() => setActiveRoom(chat)}
              aria-label={`Chat with ${chat.name || 'unknown'}`}
            >
              {chat.type === 'private' ? (
                <div className='h-16 w-16 min-w-[4rem] custom-border flex items-center justify-center overflow-hidden rounded-full'>
                  {chat.avatar ? (
                    <img 
                      className="h-full w-full object-cover" 
                      src={chat.avatar} 
                      alt={`${chat.name || 'User'}'s avatar`}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <i className="material-symbols-outlined text-4xl opacity-40">account_circle</i>
                  )}
                </div>
              ) : (
                <div className='h-16 w-16 min-w-[4rem] custom-border grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl'>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={`${chat.id}-${i}`} className="flex items-center justify-center border">
                      <i className="material-symbols-outlined text-xl opacity-40">group</i>
                    </div>
                  ))}
                </div>
              )}
              
              {!isCompact && (
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col justify-center gap-1">
                    <h1 className="text-lg font-semibold truncate">
                      {chat.name || 'New Chat'}
                    </h1>
                    <p className="text-sm opacity-60 truncate">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {chat.lastMessageTimestamp && (
                    <p className="absolute top-3 right-3 text-xs opacity-50">
                      {formatTime(chat.lastMessageTimestamp)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {!isCompact && (
              <div className="w-[calc(100%-2rem)] mx-auto custom-border-b"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default React.memo(ChatRooms);
