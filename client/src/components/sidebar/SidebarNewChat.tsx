import React, { useState } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import { useSidebar } from '@/contexts/SidebarContext';
import ChatList from '@/components/ui/ChatList';
import { useChat } from '@/contexts/ChatContext';

const chatTypes = ['person', 'group'];

const SidebarNewChat: React.FC = () => {
  const {chats} = useChat();
  const { setSidebar } = useSidebar();
  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);

  const privateChats = chats.filter(chat => chat.type === 'private')

  const getTypeClass = (type: string) =>
    `flex items-center justify-center gap-1 cursor-pointer ${
      selectedType === type ? 'opacity-100 font-bold' : 'opacity-50 hover:opacity-80'
    }`;

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      <header id="logo-container" className="flex w-full items-center h-[var(--header-height)] p-2 pr-0 justify-between">
        <SearchBar
          placeholder="Search contacts..."
        />
        <i 
          className="material-symbols-outlined text-2xl opacity-60 hover:opacity-100 p-1 cursor-pointer" 
          onClick={() => setSidebar('default')}
        >
          close
        </i>
      </header>

      <div className="flex justify-around items-center custom-border-t custom-border-b w-full h-[40px] backdrop-blur-[120px]">
        {chatTypes.map((type) => (
          <a 
            key={type}
            className={getTypeClass(type)}
            onClick={() => setSelectedType(type)}
          >
            {selectedType === type && (
              <i className="material-symbols-outlined text-green-500">check</i>
            )}
            <i className="material-symbols-outlined">
              {type === 'person' ? 'person' : 'group'}
            </i>
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </a>
        ))}
      </div>

      {privateChats.length > 0 ? (
        <ChatList chats={privateChats} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full opacity-40">
          <i className="material-symbols-outlined text-6xl">search_off</i>
          <p>No {selectedType === 'person' ? 'contacts' : 'groups'} found</p>
        </div>
      )}
    </aside>
  );
};

export default SidebarNewChat;