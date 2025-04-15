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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSidebar}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 0, scale: 0.96 }}
        transition={{ duration: 0.1, ease: "easeInOut" }}
        className="h-full"
      >
        {sidebars[currentSidebar]}
      </motion.div>
    </AnimatePresence>
  );
};

export default Sidebar;