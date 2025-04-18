import { useChat } from '@/contexts/ChatContext';
import { useChatInfo } from '@/contexts/ChatInfoContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatHeader: React.FC = () => {
  const { activeRoom } = useChat();
  const { toggleChatInfo } = useChatInfo();

  return (
    <header 
      className="absolute top-0 w-full cursor-pointer hover:shadow-2xl flex items-center justify-between h-[var(--header-height)] px-4 shadow border-b border-[var(--border-color)] backdrop-blur-[199px] z-40"
      onClick={toggleChatInfo}
    >
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeRoom?.id || "no-chat"}
          className="flex gap-3 items-center cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1,
            scale: 1,
            transition: { 
              type: 'spring', 
              stiffness: 300, 
              damping: 20,
              bounce: 0.2
            }
          }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.1 }
          }}
        >
          {!activeRoom?.isGroup ?
          <div className="h-11 w-11 custom-border rounded-full flex items-center justify-center overflow-hidden">
            {activeRoom?.avatar ? (
              <img 
                src={activeRoom.avatar} 
                alt={activeRoom.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <i className="material-symbols-outlined text-5xl opacity-40">mood</i>
            )}
          </div>
          :
            <div className='h-12 w-12 custom-border grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl'>
              <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
              <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
              <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
              <i className="material-symbols-outlined text-2xl opacity-20 flex items-center justify-center border rounded-full">mood</i>
            </div>
          }

          <h1 className="text-xl font-medium">
            {activeRoom?.name || "Select a chat"}
          </h1>
        </motion.div>
      </AnimatePresence>

      {activeRoom && (
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