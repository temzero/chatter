import { motion, AnimatePresence } from 'framer-motion';
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

      <AnimatePresence>
        {isChatInfoVisible && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'var(--sidebar-width)' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChatInfo />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Chat;