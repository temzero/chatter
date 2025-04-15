import { useChat } from '@/contexts/ChatContext';

const ChatHeader: React.FC = () => {
  const { toggleChatInfo } = useChat();

  return (
    <header className="absolute top-0 w-full cursor-pointer hover:shadow-2xl flex items-center justify-between h-[var(--header-height)] px-4 shadow border-b border-[var(--border-color)] backdrop-blur-[199px] z-40"
      onClick={toggleChatInfo}>
      <a className="flex gap-3 items-center cursor-pointer">
        <div className="h-11 w-11 custom-border rounded-full flex items-center justify-center overflow-hidden">
          <i className="material-symbols-outlined text-6xl opacity-20">mood</i>
        </div>
        <h1 className="text-xl">User Full Name</h1>
      </a>

      <div className="flex gap-2">
        <a className="flex items-center cursor-pointer rounded-full opacity-60 hover:opacity-100">
          <i className="material-symbols-outlined text-3xl">phone_enabled</i>
        </a>
      </div>
    </header>
  );
};

export default ChatHeader;
