import React, {useState} from 'react';
import SearchBar from '@/components/ui/SearchBar';
import { useSidebar } from '@/contexts/SidebarContext';
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

const SidebarSearch: React.FC = () => {
  const { setSidebar } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>(chatTypes[0]);
  const [direction, setDirection] = useState<number>(1);
  
  const getTypeClass = (type: string) =>
    `flex items-center justify-center cursor-pointer ${
      selectedType === type ? 'opacity-100 font-bold' : 'opacity-50 hover:opacity-80'
    }`;

  const filteredChats = dummyChats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatTypeChange = (type: string) => {
    if (type === selectedType) return;

    const currentIndex = chatTypes.indexOf(selectedType);
    const newIndex = chatTypes.indexOf(type);
    
    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  return (
    <aside className="w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header */}
      <header id="logo-container" className="flex w-full items-center h-[var(--header-height)] p-2 pr-0 justify-between">
        <SearchBar 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="material-symbols-outlined text-2xl opacity-60 hover:opacity-100 p-1 cursor-pointer" 
          onClick={() => setSidebar('default')}>close</i>
      </header>

      {/* Chat Type Selector */}
      <div className="flex justify-around items-center custom-border-t custom-border-b w-full h-[40px] backdrop-blur-[120px]">
          <>
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
          </>
      </div>

      <SlidingContainer selectedType={selectedType} direction={direction}>
        <ChatList chats={filteredChats}/>
      </SlidingContainer>

    </aside>
  );
};

export default SidebarSearch;
