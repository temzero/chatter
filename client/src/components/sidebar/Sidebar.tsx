import { useSidebar } from '@/contexts/SidebarContext';
import SidebarDefault from '@/components/sidebar/SidebarDefault';
import SidebarSearch from '@/components/sidebar/SidebarSearch';
import SidebarNewChat from '@/components/sidebar/SidebarNewChat';
import SidebarMore from '@/components/sidebar/SidebarMore';
import SidebarProfile from '@/components/sidebar/SidebarProfile';
import SidebarSettings from '@/components/sidebar/SidebarSettings';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const { currentSidebar } = useSidebar();

  const sidebars = {
    default: <SidebarDefault />,
    newChat: <SidebarNewChat />,
    search: <SidebarSearch />,
    more: <SidebarMore />,
    profile: <SidebarProfile />,
    settings: <SidebarSettings />,
  };

  // Define different animations for each sidebar
  const sidebarAnimations = {
    default: {
      initial: { opacity: 0, scale: .9 },
      animate: { 
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" }
      },
      exit: { 
        opacity: 0,
        transition: { 
          duration: 0,
        } 
      }
    },
    search: {
      initial: { opacity: 0, y: 400 },
      animate: { 
        opacity: 1,
        y: 0,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 28,
          bounce: 0.2
        }
      },
      exit: { 
        opacity: 0,
        y: 400,
        transition: { 
          duration: 0.2,
        } 
      }
    },
    newChat: {
      initial: { opacity: 0, y: 400 },
      animate: { 
        opacity: 1,
        y: 0,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 28,
          bounce: 0.2
        }
      },
      exit: { 
        opacity: 0,
        y: 400,
        transition: { 
          duration: 0.2,
        } 
      }
    },
    fallback: {
      initial: { opacity: 0, x: -300 },
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
        x: -300,
        transition: { 
          duration: 0.2,
        } 
      }
    }
  };

  // Get the animation for the current sidebar or use fallback
  const currentAnimation = sidebarAnimations[currentSidebar] || sidebarAnimations.fallback;

  return (
    <div className="bg-[var(--sidebar-color)] h-full flex flex-col shadow border-[var(--border-color)] border-r-2 transition-all duration-300 ease-in-out z-50">
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSidebar}
        initial={currentAnimation.initial}
        animate={currentAnimation.animate}
        exit={currentAnimation.exit}
        transition={currentAnimation.transition}
        className="h-full"
      >
        {sidebars[currentSidebar]}
      </motion.div>
    </AnimatePresence>
    </div>
  );
};

export default Sidebar;