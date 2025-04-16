import { useChat } from '@/contexts/ChatContext';

interface ChatHeaderProps {
  chatData?: {
    id: number;
    name: string;
    avatar?: string;
    type: string;
  };
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatData }) => {
  const { toggleChatInfo } = useChat();

  return (
    <header 
      className="absolute top-0 w-full cursor-pointer hover:shadow-2xl flex items-center justify-between h-[var(--header-height)] px-4 shadow border-b border-[var(--border-color)] backdrop-blur-[199px] z-40"
      onClick={toggleChatInfo}
    >
      <div className="flex gap-3 items-center cursor-pointer">
        <div className="h-11 w-11 custom-border rounded-full flex items-center justify-center overflow-hidden bg-[var(--avatar-bg-color)]">
          {chatData?.avatar ? (
            <img 
              src={chatData.avatar} 
              alt={chatData.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <i className="material-symbols-outlined text-3xl opacity-60">account_circle</i>
          )}
        </div>
        <h1 className="text-xl font-medium">
          {chatData?.name || "Select a chat"}
        </h1>
      </div>

      {chatData && (
        <div className="flex gap-2">
          <a className="flex items-center cursor-pointer rounded-full opacity-60 hover:opacity-100 p-1">
            <i className="material-symbols-outlined text-2xl">phone_enabled</i>
          </a>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;