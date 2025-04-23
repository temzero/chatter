import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { useChatInfo } from '@/contexts/ChatInfoContext';
import ChatInfo from './chatInfo/ChatInfo';
import ChatHeader from './ChatHeader';
import ChatBar from './ChatBar';
import ChatBox from './ChatBox';

const Chat: React.FC = () => {
  const { activeChat } = useChat();
  const { isChatInfoVisible } = useChatInfo();
  
  return (
    <section className="flex-1 flex h-full">
      <section className="relative flex-1 flex flex-col justify-between h-full overflow-hidden">
        <ChatHeader />
        <ChatBox />
        <AnimatePresence>
          {activeChat?.type !== 'channel' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatBar />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ChatInfo sidebar animation */}
      <AnimatePresence>
        {isChatInfoVisible && (
          <motion.div
            initial={{ opacity: 0, x: 300, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'var(--sidebar-width)' }}
            exit={{ opacity: 0, x: 300, width: 0  }}
            // initial={{ opacity: 0, width: 0 }}
            // animate={{ opacity: 1, width: 'var(--sidebar-width)' }}
            // exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChatInfo />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Chat;