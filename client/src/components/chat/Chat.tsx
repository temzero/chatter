import ChatInfo from './chatInfo/ChatInfo';
import ChatHeader from './ChatHeader';
import ChatBar from './ChatBar';
import ChatBox from './ChatBox';
import { useChat } from '@/contexts/ChatContext';

const Chat: React.FC = () => {
  const { isChatInfoVisible } = useChat();
  
  return (
    <section className="flex-1 flex h-full">
      <section className="relative flex-1 flex flex-col h-full">
        <ChatHeader />
        <ChatBox />
        <ChatBar />
      </section>

      {isChatInfoVisible && <ChatInfo />}
    </section>
  );
};

export default Chat;
