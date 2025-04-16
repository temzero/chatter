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
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2, ease: "easeInOut" }
    },

    // Default animation if mode isn't specified
    fallback: {
      initial: { opacity: 0, x: -300 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -300 },
      transition: { duration: 0.2 }
    }
  };

  // Get the animation for the current sidebar or use fallback
  const currentAnimation = sidebarAnimations[currentSidebar] || sidebarAnimations.fallback;

  return (
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
  );
};

export default Sidebar;