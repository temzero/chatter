import React from "react";
import { useActiveChat } from "@/stores/chatStore";
import { motion } from "framer-motion";
import { ChatType } from "@/types/enums/ChatType";
import DirectChat from "./SidebarInfoEdit/DirectChat";
import GroupChat from "./SidebarInfoEdit/GroupChat";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import OpenAttachmentBtn from "@/components/ui/OpenAttachmentBtn";

const SidebarInfoDefault: React.FC = () => {
  const activeChat = useActiveChat();
  const isSidebarInfoVisible = useSidebarInfoStore(
    (state) => state.isSidebarInfoVisible
  );
  const isDirect = activeChat?.type === ChatType.DIRECT;

  if (!activeChat) return null;

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      {isSidebarInfoVisible && (
        <motion.div
          key={activeChat.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4 w-full min-w-[240px]"
        >
          {isDirect ? <DirectChat /> : <GroupChat />}
        </motion.div>
      )}
      <OpenAttachmentBtn />
    </aside>
  );
};

export default SidebarInfoDefault;
