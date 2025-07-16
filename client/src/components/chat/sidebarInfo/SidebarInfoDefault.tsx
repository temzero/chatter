import React from "react";
import { useActiveChat } from "@/stores/chatStore";
import { motion } from "framer-motion";
import { ChatType } from "@/types/enums/ChatType";
import DirectChat from "./SidebarInfoEdit/DirectChat";
import GroupChat from "./SidebarInfoEdit/GroupChat";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";

const SidebarInfoDefault: React.FC = () => {
  const activeChat = useActiveChat();
  const isSidebarInfoVisible = useSidebarInfoStore(
    (state) => state.isSidebarInfoVisible
  );
  const isDirect = activeChat?.type === ChatType.DIRECT;

  if (!activeChat) return null;

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      {/* Header will be rendered inside DirectChat/GroupChat */}
      {/* <div className="overflow-x-hidden overflow-y-auto h-screen"> */}
        {isSidebarInfoVisible && (
          <motion.div
            key={activeChat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4 w-full min-w-[240px]"
          >
            {isDirect ? <DirectChat /> : <GroupChat />}
          </motion.div>
        )}
      {/* </div> */}
    </aside>
  );
};

export default SidebarInfoDefault;
