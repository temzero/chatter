import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentSidebarInfo } from "@/stores/sidebarInfoStore";
import { sidebarInfoAnimations } from "@/common/animations/sidebarInfoAnimations";
import { useSidebarInfoWidth } from "@/common/hooks/useSidebarInfoWidth";
import ChatInfoDefault from "@/components/chat/sidebarInfo/SidebarInfoDefault";
import SidebarInfoAttachments from "./sidebarInfoMedia/SidebarInfoAttachments";
import DirectChatEdit from "@/components/chat/sidebarInfo/sidebarInfoEdit/DirectChatEdit";
import ChatMembersEdit from "@/components/chat/sidebarInfo/sidebarInfoEdit/ChatMembersEdit";
import GroupChatEdit from "@/components/chat/sidebarInfo/sidebarInfoEdit/GroupChatEdit";
import { useIsMobile } from "@/stores/deviceStore";

const SidebarInfo: React.FC = () => {
  const isMobile = useIsMobile();
  const currentSidebarInfo = useCurrentSidebarInfo();
  const sidebarInfoWidthClass = useSidebarInfoWidth();

  // Define your chat info components
  const chatInfoComponents = {
    default: <ChatInfoDefault />,
    media: <SidebarInfoAttachments />,
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
        "glass-panel",
        "h-full",
        !isMobile && "border-l-2",
        sidebarInfoWidthClass
      )}
    >
      {isMobile && (
        <div
          className={clsx(
            "fixed w-full h-full backdrop-blur-2xl -z-1",
            // "bg-(--panel-color)",
          )}
        />
      )}

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
