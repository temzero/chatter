import React from "react";
import { useActiveChat } from "@/stores/chatStore";
import { motion } from "framer-motion";
import { ChatType } from "@/types/enums/ChatType";
import DirectChat from "./SidebarInfoEdit/DirectChat";
import GroupChat from "./SidebarInfoEdit/GroupChat";
import OpenAttachmentBtn from "@/components/ui/OpenAttachmentBtn";

const SidebarInfoDefault: React.FC = () => {
  const activeChat = useActiveChat();
  const isDirect = activeChat?.type === ChatType.DIRECT;

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDirect ? <DirectChat /> : <GroupChat />}
      </motion.div>
      <OpenAttachmentBtn />
    </aside>
  );
};

export default SidebarInfoDefault;
