import { useChatInfo } from '@/contexts/ChatInfoContext';
import { AnimatePresence, motion } from 'framer-motion';
import ChatInfoDefault from './ChatInfoDefault';
import ChatInfoMedia from './ChatInfoMedia';
import ChatInfoSaved from './ChatInfoSaved';
import ChatInfoEdit from './ChatInfoEdit';

const ChatInfo: React.FC = () => {
  const { chatInfoMode } = useChatInfo();

  // Define your chat info components
  const chatInfoComponents = {
    default: <ChatInfoDefault />,
    media: <ChatInfoMedia />,
    saved: <ChatInfoSaved />,
    edit: <ChatInfoEdit />,
  };

  // Animation configurations
  const animations = {
    default: {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 20,
          bounce: 0.2
        }
      },
      exit: { 
        opacity: 0,
        transition: { 
          duration: 0,
        } 
      }
    },
    media: {
      initial: { opacity: 0, y: 700 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 26,
          bounce: 0.2
        }
      },
      exit: { 
        opacity: 0, 
        y: 900,  // Different direction and distance for exit
        transition: { 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]  // Smoother ease-out
        } 
      }
    },

    saved: {
      initial: { opacity: 0, y: 700 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 26,
          bounce: 0.2
        }
      },
      exit: { 
        opacity: 0, 
        y: 900,  // Different direction and distance for exit
        transition: { 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]  // Smoother ease-out
        } 
      }
    },

    edit: {
      initial: { opacity: 0, x: 'var(--sidebar-width)' },
      animate: { 
        opacity: 1, 
        x: 0,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 28,
          bounce: 0.2
        }
      },
      exit: { 
        opacity: 0, 
        x: 'var(--sidebar-width)',  
        transition: { duration: 0.2 } 
      }
    },

    fallback: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2, ease: "easeOut" }
    }

  };

  // Get the current component and animation
  const CurrentComponent = chatInfoComponents[chatInfoMode] || null;
  const currentAnimation = animations[chatInfoMode] || animations.fallback;

  return (
    <div className="h-full w-full relative overflow-hidden bg-[var(--sidebar-color)] border-l-2 border-[var(--border-color)] shadow-lg">
      <AnimatePresence mode="wait">
        {CurrentComponent && (
          <motion.div
            key={chatInfoMode}
            initial={currentAnimation.initial}
            animate={currentAnimation.animate}
            exit={currentAnimation.exit}
            transition={currentAnimation.transition}
            className="absolute inset-0 overflow-y-auto"
          >
            {CurrentComponent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInfo;