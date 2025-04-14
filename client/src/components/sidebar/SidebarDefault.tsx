import React from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import logo from '@/assets/icon/logo.svg';

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

const ChatSidebar: React.FC = () => {
  const { setSidebar, isCompact } = useSidebar();
  
  const getGroupClass = () =>
    `flex items-center justify-center opacity-40 hover:opacity-80 cursor-pointer`;

  return (
    <aside className={`h-full flex flex-col shadow border-[var(--border-color)] bg-[var(--sidebar-color)] border-r-2 transition-all duration-300 ease-in-out
        ${isCompact ? 'w-24' : 'w-80'}`}
    >
      {/* Header */}
      <header id="logo-container" className={`flex w-full items-center h-[var(--header-height)] justify-between ${isCompact ? '' : 'pl-4'}`}>
        <a className={`flex gap-2 items-center cursor-pointer w-full`} onClick={() => setSidebar('more')}>
          <div className={`w-8 h-8 flex items-center justify-center ${isCompact ? 'mx-auto' : ''}`}>
            <img className="h-full w-full" src={logo} alt="Logo" />
          </div>
          {isCompact || <span className="text-2xl">Chatter</span>}
        </a>

        {isCompact ||
        <div className="flex gap-2">
          <a className="cursor-pointer select-none flex items-center opacity-40 hover:opacity-80"
            onClick={() => setSidebar('newChat')}>
            <i className="material-symbols-outlined text-2xl">add</i>
          </a>
          <a className="cursor-pointer select-none flex items-center opacity-40 hover:opacity-80"
           onClick={() => setSidebar('search')}>
            <i className="material-symbols-outlined text-2xl">search</i>
          </a>
          <a className="cursor-pointer select-none flex items-center opacity-40 hover:opacity-80">
            <i className="material-symbols-outlined text-2xl" 
              onClick={() => setSidebar('more')}>more_vert</i>
          </a>
        </div>
        }
      </header>

      {/* Groups */}
      <div className="flex justify-around items-center custom-border-t custom-border-b w-full h-[40px] backdrop-blur-[120px]">
        {isCompact ? (
          <a className={getGroupClass()}>All</a>
        ) : (
          <>
            <a className={getGroupClass()}>All</a>
            <a className={getGroupClass()}>Groups</a>
            <a className={getGroupClass()}>Friends</a>
            <a className={getGroupClass()}>Work</a>
            <a className={getGroupClass()}>Study</a>
            <i className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer text-sm -mr-2">arrow_forward_ios</i>
          </>
        )}
      </div>

    {/* Users */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {dummyChats.map((chat) => (
        <>
        <div key={chat.id} className="relative flex items-center w-full h-24 gap-2 p-3 transition-all duration-300 ease-in-out cursor-pointer hover:bg-[var(--hover-color)]">
          <div className="h-16 w-16 min-w-16 custom-border rounded-full flex items-center justify-center overflow-hidden">
            {chat.avatar ? (
              <img className="h-full w-full object-cover" src={chat.avatar} alt={`${chat.name}'s avatar`} />
            ) : (
              <i className="material-symbols-outlined text-6xl opacity-20">mood</i>
            )}
          </div>
          
          {isCompact || 
          <>
            <div className="flex justify-center flex-col gap-1">
              <h1 className="text-lg font-semibold">{chat.name}</h1>
              <p className="opacity-60 overflow-hidden text-xs line-clamp-2">{chat.lastMessage}</p>
            </div>

            <p className="absolute top-3 right-4 text-xs opacity-40">{chat.time}</p>
          </>
          }

        </div>

        {isCompact || <div className="w-[90%] mx-auto custom-border-b"></div>}
        </>
      ))}
    </div>

    </aside>
  );
};

export default ChatSidebar;
