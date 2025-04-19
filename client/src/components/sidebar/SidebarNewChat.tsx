import React, { useState } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import { useSidebar } from '@/contexts/SidebarContext';

const dummyChats = [
  { id: 1, name: 'Alice', avatar: '', lastMessage: 'Hey there!', time: '10:45 AM' },
  { id: 2, name: 'Bob', avatar: '', lastMessage: 'See you later', time: '9:20 AM' },
  // ... rest of your dummy chats
];

type ChatType = 'person' | 'group';

const SidebarNewChat: React.FC = () => {
  const { setSidebar } = useSidebar();
  const [selectedType, setSelectedType] = useState<ChatType>('person');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = dummyChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}

      <header id="logo-container" className="flex w-full items-center h-[var(--header-height)] p-2 pr-0 justify-between">
        <SearchBar 
          placeholder='New Chat'
          value={searchQuery}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="material-symbols-outlined text-2xl opacity-60 hover:opacity-100 p-1 cursor-pointer" 
          onClick={() => setSidebar('default')}>close</i>
      </header>

      {/* Type Selector */}
      <div className="flex justify-around items-center w-full h-[40px] backdrop-blur-[120px] custom-border-t custom-border-b">
        <a
          className={`w-full flex items-center justify-center gap-1 cursor-pointer ${
            selectedType === 'person' 
              ? 'opacity-100' 
              : 'opacity-40 hover:opacity-80'
          }`}
          onClick={() => setSelectedType('person')}
        >
          {selectedType === 'person' && <i className="material-symbols-outlined text-green-500">check</i>}
          <i className="material-symbols-outlined">person</i>
          <span>Person</span>
        </a>
        <a
          className={`w-full flex items-center justify-center gap-1 cursor-pointer ${
            selectedType === 'group' 
              ? 'opacity-100' 
              : 'opacity-40 hover:opacity-80'
          }`}
          onClick={() => setSelectedType('group')}
        >
          {selectedType === 'group' && <i className="material-symbols-outlined text-green-500">check</i>}
          <i className="material-symbols-outlined">group</i>
          <span>Group</span>
        </a>
      </div>

      {/* Users/Groups List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <React.Fragment key={chat.id}>
              <div className="flex items-center w-full gap-2 p-3 py-2 transition-all duration-300 ease-in-out cursor-pointer hover:bg-[var(--hover-color)]">
                <div className="h-16 w-16 custom-border rounded-full flex items-center justify-center overflow-hidden">
                  {chat.avatar ? (
                    <img className="h-full w-full object-cover" src={chat.avatar} alt={`${chat.name}'s avatar`} />
                  ) : (
                    <i className="material-symbols-outlined text-6xl opacity-20">mood</i>
                  )}
                </div>
                <div className="flex justify-center flex-col gap-1">
                  <h1 className="text-xl font-semibold">{chat.name}</h1>
                </div>
              </div>
              <div className="w-[90%] mx-auto custom-border-b"></div>
            </React.Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <i className="material-symbols-outlined text-6xl">search_off</i>
            <p>No {selectedType === 'person' ? 'people' : 'groups'} found</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarNewChat;