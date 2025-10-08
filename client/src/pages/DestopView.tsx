import ChatBox from "@/components/chat/ChatBox";
import SidebarInfo from "@/components/chat/sidebarInfo/SidebarInfo";
import Sidebar from "@/components/sidebar/Sidebar";
import { useSidebarInfoVisibility } from "@/stores/sidebarInfoStore";
import { useSidebarStore } from "@/stores/sidebarStore";

const DesktopView: React.FC = () => {
  const isSidebarVisible = useSidebarInfoVisibility();
  const isSidebarCompact = useSidebarStore((state) => state.isCompact);
  const sidebarClasses = isSidebarCompact
    ? "w-[var(--sidebar-width-small)]"
    : "w-[var(--sidebar-width)]";

  return (
    <div className="w-full h-full flex justify-between">
      <div id="sidebar" className={sidebarClasses}>
        <Sidebar />
      </div>
      <ChatBox />
      {isSidebarVisible && (
        <div id="sidebar-info" className="w-[var(--sidebar-width)]">
          <SidebarInfo />
        </div>
      )}
    </div>
  );
};

export default DesktopView;
