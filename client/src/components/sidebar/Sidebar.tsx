// components/Sidebar.tsx
import { useSidebar } from '@/contexts/SidebarContext';
import SidebarDefault from '@/components/sidebar/SidebarDefault';
import SidebarSearch from '@/components/sidebar/SidebarSearch';
import SidebarNewChat from '@/components/sidebar/SidebarNewChat';
import SidebarMore from '@/components/sidebar/SidebarMore';
import SidebarProfile from '@/components/sidebar/SidebarProfile';
import SidebarSettings from '@/components/sidebar/SidebarSettings';

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

  return sidebars[currentSidebar];
};

export default Sidebar;