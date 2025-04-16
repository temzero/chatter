import React, { useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import logo from '@/assets/icon/logo.svg';
import SlidingContainer from '@/components/ui/SlidingContainer';
import ChatList from '@/components/ui/ChatList';

const dummyChats = [
  { id: 1, name: 'Alice', avatar: '', lastMessage: 'Hey there!', time: '10:45 AM', type: 'friends' },
  { id: 2, name: 'Bob', avatar: '', lastMessage: 'See you later', time: '9:20 AM', type: 'work' },
  { id: 3, name: 'Charlie', avatar: '', lastMessage: 'Lets meet up tomorrow.', time: '8:15 AM', type: 'study' },
  { id: 4, name: 'Diana', avatar: '', lastMessage: 'Got it, thanks!', time: '7:05 AM', type: 'friends' },
  { id: 5, name: 'Eve', avatar: '', lastMessage: 'Did you finish the project?', time: 'Yesterday', type: 'work' },
  { id: 6, name: 'Frank', avatar: '', lastMessage: 'Call me when you are free.', time: 'Yesterday', type: 'friends' },
  { id: 7, name: 'Grace', avatar: '', lastMessage: 'Ill be late.', time: 'Monday', type: 'work' },
  { id: 8, name: 'Hank', avatar: '', lastMessage: 'Awesome job!', time: 'Sunday', type: 'study' },
  { id: 9, name: 'Ivy', avatar: '', lastMessage: 'Can we reschedule?', time: 'Saturday', type: 'work' },
  { id: 10, name: 'Jake', avatar: '', lastMessage: 'No worries, take care.', time: 'Friday', type: 'friends' },
];

const chatTypes = ['all', 'friends', 'work', 'study', 'groups'];

const ChatSidebar: React.FC = () => {
  const { setSidebar, isCompact } = useSidebar();
  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  const filteredChats = React.useMemo(() => {
    return selectedType === 'all'
      ? dummyChats
      : dummyChats.filter((chat) => chat.type === selectedType);
  }, [selectedType]);
  
  const getTypeClass = React.useCallback((type: string) => 
    `flex items-center justify-center cursor-pointer p-2 ${
      selectedType === type ? 'opacity-100 font-bold' : 'opacity-50 hover:opacity-80'
    }`,
    [selectedType]
  );

  const handleChatTypeChange = (type: string) => {
    if (type === selectedType) return;

    const currentIndex = chatTypes.indexOf(selectedType);
    const newIndex = chatTypes.indexOf(type);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  return (
    <aside
      className={`h-full flex flex-col shadow border-[var(--border-color)] bg-[var(--sidebar-color)] border-r-2 transition-all duration-300 ease-in-out z-50 ${
        isCompact ? 'w-[var(--sidebar-width-small)]' : 'w-[var(--sidebar-width)]'
      }`}
    >
      {/* Header */}
      <header
        id="logo-container"
        className={`flex w-full items-center h-[var(--header-height)] justify-between ${
          isCompact ? '' : 'pl-4'
        }`}
      >
        <a
          className="flex gap-2 items-center cursor-pointer w-full"
          onClick={() => setSidebar('more')}
        >
          <div className={`w-8 h-8 flex items-center justify-center ${isCompact ? 'mx-auto' : ''}`}>
            <img className="h-full w-full" src={logo} alt="Logo" />
          </div>
          {isCompact || <span className="text-2xl">Chatter</span>}
        </a>

        {!isCompact && (
          <div className="flex">
            <a
              className="cursor-pointer select-none flex items-center opacity-40 hover:opacity-80 p-1 rounded"
              onClick={() => setSidebar('newChat')}
            >
              <i className="material-symbols-outlined text-2xl">add</i>
            </a>
            <a
              className="cursor-pointer select-none flex items-center opacity-40 hover:opacity-80 pl-1 rounded"
              onClick={() => setSidebar('search')}
            >
              <i className="material-symbols-outlined text-2xl">search</i>
            </a>
            <a className="cursor-pointer select-none flex items-center opacity-40 hover:opacity-80 p-1 rounded">
              <i
                className="material-symbols-outlined text-2xl"
                onClick={() => setSidebar('more')}
              >
                more_vert
              </i>
            </a>
          </div>
        )}
      </header>

      {/* Chat Type Selector */}
      <div className="flex justify-around items-center custom-border-t custom-border-b w-full backdrop-blur-[120px]">
        {isCompact ? (
          selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
        ) : (
          <>
            {chatTypes.map((type) => (
              <a key={type} className={getTypeClass(type)} onClick={() => handleChatTypeChange(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </a>
            ))}
            <i className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer text-sm -mr-2">
              arrow_forward_ios
            </i>
          </>
        )}
      </div>

      {/* Chat List Container */}
      <SlidingContainer selectedType={selectedType} direction={direction}>
        <ChatList chats={filteredChats} isCompact={isCompact} />
      </SlidingContainer>
    </aside>
  );
};

export default ChatSidebar;
