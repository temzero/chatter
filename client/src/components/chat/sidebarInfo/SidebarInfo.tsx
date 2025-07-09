import { AnimatePresence, motion } from "framer-motion";
import { useCurrentSidebarInfo } from "@/stores/sidebarInfoStore";
import ChatInfoDefault from "./SidebarInfoDefault";
import ChatInfoMedia from "./SidebarInfoMedia";
import ChatInfoSaved from "./SidebarInfoSaved";
import PrivateChatEdit from "./SidebarInfoEdit/DirectChatEdit";
import GroupChatEdit from "./SidebarInfoEdit/GroupChatEdit";
import { sidebarInfoAnimations } from "@/animations/sidebarInfoAnimations";

const SidebarInfo: React.FC = () => {
  const currentSidebarInfo = useCurrentSidebarInfo();

  // Define your chat info components
  const chatInfoComponents = {
    default: <ChatInfoDefault />,
    media: <ChatInfoMedia />,
    saved: <ChatInfoSaved />,
    directEdit: <PrivateChatEdit />,
    groupEdit: <GroupChatEdit />,
  };

  // Get the current component and animation
  const CurrentComponent = chatInfoComponents[currentSidebarInfo] || null;
  const animation =
    sidebarInfoAnimations[
      currentSidebarInfo as keyof typeof sidebarInfoAnimations
    ] || sidebarInfoAnimations.fallback;

  return (
    <div className="h-full w-full relative overflow-hidden bg-[var(--sidebar-color)] border-l-2 border-[var(--border-color)] shadow-lg">
      <AnimatePresence mode="wait">
        {CurrentComponent && (
          <motion.div
            key={currentSidebarInfo}
            {...animation}
            className="absolute inset-0 overflow-y-auto"
          >
            {CurrentComponent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarInfo;
