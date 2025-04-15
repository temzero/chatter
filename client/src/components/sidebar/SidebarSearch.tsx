import React, {useState} from 'react';
import SearchBar from '@/components/ui/SearchBar';
import { useSidebar } from '@/contexts/SidebarContext';
import ChatListContainer from '../ui/ChatListContainer';

const dummyChats = [
  { id: 1, name: 'Alice', avatar: '', lastMessage: 'Hey there!', time: '10:45 AM' },
  { id: 2, name: 'Bob', avatar: '', lastMessage: 'See you later', time: '9:20 AM' },
  { id: 3, name: 'Charlie', avatar: '', lastMessage: 'Let’s meet up tomorrow.', time: '8:15 AM' },
  { id: 4, name: 'Diana', avatar: '', lastMessage: 'Got it, thanks!', time: '7:05 AM' },
  { id: 5, name: 'Eve', avatar: '', lastMessage: 'Did you finish the project?', time: 'Yesterday' },
  { id: 6, name: 'Frank', avatar: '', lastMessage: 'Call me when you’re free.', time: 'Yesterday' },
  { id: 7, name: 'Grace', avatar: '', lastMessage: 'I’ll be late.', time: 'Monday' },
  { id: 8, name: 'Hank', avatar: '', lastMessage: 'Awesome job!', time: 'Sunday' },
  { id: 9, name: 'Ivy', avatar: '', lastMessage: 'Can we reschedule?', time: 'Saturday' },
  { id: 10, name: 'Jake', avatar: '', lastMessage: 'No worries, take care.', time: 'Friday' },
];

const chatTypes = ['all', 'friends', 'work', 'study', 'groups'];

const SidebarSearch: React.FC = () => {
  const { setSidebar } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatType, setSelectedChatType] = useState<string>('all');
  const [direction, setDirection] = useState<number>(1); // 1 for right, -1 for left
  
  const getGroupClass = (type: string) =>
    `flex items-center justify-center cursor-pointer ${
      selectedChatType === type ? 'opacity-100 font-bold' : 'opacity-50 hover:opacity-80'
    }`;

  const filteredChats = dummyChats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatTypeChange = (type: string) => {
    if (type === selectedChatType) return;

    const currentIndex = chatTypes.indexOf(selectedChatType);
    const newIndex = chatTypes.indexOf(type);
    
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedChatType(type);
  };

  return (
    <aside className="w-[var(--sidebar-width)] border-r-2 h-full flex flex-col shadow border-[var(--border-color)] bg-[var(--sidebar-color)] z-50">
      {/* Header */}
      <header id="logo-container" className="flex w-full items-center h-[var(--header-height)] p-2 gap-1 justify-between">
        <SearchBar 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <a className="cursor-pointer select-none flex items-center opacity-40 hover:opacity-80">
          <i className="material-symbols-outlined text-2xl" 
            onClick={() => setSidebar('default')}>close</i>
        </a>
      </header>

      {/* Chat Type Selector */}
      <div className="flex justify-around items-center custom-border-t custom-border-b w-full h-[40px] backdrop-blur-[120px]">
          <>
            {chatTypes.map((type) => (
              <a 
                key={type}
                className={getGroupClass(type)}
                onClick={() => handleChatTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </a>
            ))}
            <i className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer text-sm -mr-2">arrow_forward_ios</i>
          </>
      </div>

    {/* Users */}
    <ChatListContainer
        selectedChatType={selectedChatType}
        direction={direction}
        chats={filteredChats}
    />

    </aside>
  );
};

export default SidebarSearch;
