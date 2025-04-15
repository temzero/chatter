import { useChat } from '@/contexts/ChatContext';
import ChatInfoView from './ChatInfoView';
import ChatInfoEdit from './ChatInfoEdit';

const ChatInfo: React.FC = () => {
  const { chatInfoMode } = useChat();

  return (
    chatInfoMode === 'view' ? <ChatInfoView /> : <ChatInfoEdit />
  );
};

export default ChatInfo;