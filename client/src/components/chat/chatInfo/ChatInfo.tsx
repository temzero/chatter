import { useChat } from '@/contexts/ChatContext';
import { AnimatePresence, motion } from 'framer-motion';
import ChatInfoView from './ChatInfoView';
import ChatInfoMedia from './ChatInfoMedia';
import ChatInfoSaved from './ChatInfoSaved';
import ChatInfoEdit from './ChatInfoEdit';

interface ChatInfoProps {
  chatData?: {
    id: number;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    type: string;
  };
}

const ChatInfo: React.FC<ChatInfoProps> = () => {
  const { chatInfoMode } = useChat();

  // Define your chat info components
  const chatInfo = {
    view: <ChatInfoView />,
    media: <ChatInfoMedia />,
    saved: <ChatInfoSaved />,
    edit: <ChatInfoEdit />,
  };

  // Define different animations for each mode
  const animations = {
    view: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    media: {
      initial: { opacity: 0, y: 700 },
      animate: { opacity: 1, y: 1 },
      exit: { opacity: 0, y: 700 },
    },
    fallback: {
      initial: { opacity: 0, x: 300 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 300 },
    }
  };

  // Get the animation for the current mode or use fallback
  const currentAnimation = animations[chatInfoMode] || animations.fallback;

  return (
    <div className="h-full w-full relative overflow-hidden bg-[var(--sidebar-color)] border-l-2 border-[var(--border-color)] shadow-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={chatInfoMode}
          initial={currentAnimation.initial}
          animate={currentAnimation.animate}
          exit={currentAnimation.exit}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          {chatInfo[chatInfoMode]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ChatInfo;