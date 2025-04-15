import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatList from '@/components/ui/ChatList';

interface ChatListContainerProps {
  selectedChatType: string;
  direction: number;
  chats: Array<{
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    type: string;
  }>;
  isCompact: boolean;
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 400 : -400,
      opacity: 0
    };
  },
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      x: direction > 0 ? -400 : 400,
      opacity: 0
    };
  }
};

const ChatListContainer: React.FC<ChatListContainerProps> = ({
  selectedChatType,
  direction,
  chats,
  isCompact
}) => {
  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={selectedChatType}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 }
          }}
          className="absolute inset-0"
        >
          <ChatList 
            chats={chats}
            isCompact={isCompact}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChatListContainer;