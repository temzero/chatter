import { lazy } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentSidebarInfo } from "@/stores/sidebarInfoStore";
import { sidebarInfoAnimations } from "@/common/animations/sidebarInfoAnimations";
import { useSidebarInfoWidth } from "@/common/hooks/useSidebarInfoWidth";
import ChatInfoDefault from "@/components/chat/sidebarInfo/SidebarInfoDefault";
const ChatInfoMedia = lazy(
  () =>
    import("@/components/chat/sidebarInfo/sidebarInfoMedia/SidebarInfoMedia")
);
const DirectChatEdit = lazy(
  () => import("@/components/chat/sidebarInfo/sidebarInfoEdit/DirectChatEdit")
);
const GroupChatEdit = lazy(
  () => import("@/components/chat/sidebarInfo/sidebarInfoEdit/GroupChatEdit")
);
const ChatMembersEdit = lazy(
  () => import("@/components/chat/sidebarInfo/sidebarInfoEdit/ChatMembersEdit")
);

const SidebarInfo: React.FC = () => {
  const currentSidebarInfo = useCurrentSidebarInfo();
  const sidebarInfoWidthClass = useSidebarInfoWidth();

  // Define your chat info components
  const chatInfoComponents = {
    default: <ChatInfoDefault />,
    media: <ChatInfoMedia />,
    directEdit: <DirectChatEdit />,
    groupEdit: <GroupChatEdit />,
    membersEdit: <ChatMembersEdit />,
  };

  // Get the current component and animation
  const CurrentComponent = chatInfoComponents[currentSidebarInfo] || null;
  const animation =
    sidebarInfoAnimations[
      currentSidebarInfo as keyof typeof sidebarInfoAnimations
    ] || sidebarInfoAnimations.fallback;

  return (
    <div
      className={clsx(
        "relative h-full overflow-hidden bg-(--sidebar-color) border-l-2 border-(--border-color) shadow-lg select-none",
        sidebarInfoWidthClass
      )}
    >
      <AnimatePresence mode="wait">
        {CurrentComponent && (
          <motion.div
            key={currentSidebarInfo}
            className="absolute inset-0 overflow-y-auto"
            {...animation}
          >
            {CurrentComponent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarInfo;
