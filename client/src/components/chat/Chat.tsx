import { motion, AnimatePresence } from 'framer-motion';
import ChatInfo from './chatInfo/ChatInfo';
import ChatHeader from './ChatHeader';
import ChatBar from './ChatBar';
import ChatBox from './ChatBox';
import { useChat } from '@/contexts/ChatContext';

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

const Chat: React.FC = () => {
  const { isChatInfoVisible, activeChat } = useChat();
  const activeChatData = dummyChats.find(chat => chat.id === activeChat);
  
  return (
    <section className="flex-1 flex h-full">
      <section className="relative flex-1 flex flex-col h-full">
        <ChatHeader chatData={activeChatData} />
        <ChatBox chatData={activeChatData} />
        <ChatBar chatData={activeChatData} />
      </section>

      <AnimatePresence>
        {isChatInfoVisible && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'var(--sidebar-width)' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChatInfo chatData={activeChatData} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Chat;