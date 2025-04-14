import { useChat } from '@/contexts/ChatContext';
import ChatInfoView from './ChatInfoView';
import ChatInfoEdit from './ChatInfoEdit';

const ChatInfo: React.FC = () => {
  const { chatInfoMode, isChatInfoVisible } = useChat();

  if (!isChatInfoVisible) return null;

  return (
    <aside className="w-80 border-l-2 h-full flex flex-col shadow border-[var(--border-color)] bg-[var(--sidebar-color)]">
      {chatInfoMode === 'view' ? <ChatInfoView /> : <ChatInfoEdit />}
    </aside>
  );
};

export default ChatInfo;