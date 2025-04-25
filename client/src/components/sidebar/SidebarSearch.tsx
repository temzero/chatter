import React, { useState, useMemo } from 'react';
import SearchBar from '@/components/ui/SearchBar';
import { useSidebar } from '@/contexts/SidebarContext';
import SlidingContainer from '@/components/ui/SlidingContainer';
import ChatList from '@/components/ui/ChatList';
import { useChat } from '@/contexts/ChatContext';

const chatTypes = ['all', 'private', 'group', 'channel'];

const SidebarSearch: React.FC = () => {
  const { chats } = useChat(); // use context values
  const { setSidebar } = useSidebar();
  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  const getTypeClass = (type: string) =>
    `flex items-center justify-center cursor-pointer ${
      selectedType === type ? 'opacity-100 font-bold' : 'opacity-50 hover:opacity-80'
    }`;

  const filteredChats = useMemo(() => {
    // First filter by type
    let result = chats;
    if (selectedType !== 'all') {
      result = chats.filter(chat => chat.type === selectedType);
    }

    // Then filter by search term (already handled in context)
    return result;
  }, [selectedType, chats]);

  const handleChatTypeChange = (type: string) => {
    if (type === selectedType) return;

    const currentIndex = chatTypes.indexOf(selectedType);
    const newIndex = chatTypes.indexOf(type);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      <header id="logo-container" className="flex w-full items-center h-[var(--header-height)] p-2 pr-0 justify-between">
        <SearchBar 
          placeholder="Search chats..."
        />
        <i className="material-symbols-outlined text-2xl opacity-60 hover:opacity-100 p-1 cursor-pointer" 
          onClick={() => setSidebar('default')}>close</i>
      </header>

      <div className="flex justify-around items-center custom-border-t custom-border-b w-full h-[40px] backdrop-blur-[120px]">
        {chatTypes.map((type) => (
          <a 
            key={type}
            className={getTypeClass(type)}
            onClick={() => handleChatTypeChange(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </a>
        ))}
        <i className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer text-sm -mr-2">arrow_forward_ios</i>
      </div>

      <SlidingContainer selectedType={selectedType} direction={direction}>
        <ChatList chats={filteredChats}/>
      </SlidingContainer>
    </aside>
  );
};

export default SidebarSearch;