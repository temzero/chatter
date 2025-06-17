import React from "react";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { motion } from "framer-motion";
import { ChatType } from "@/types/enums/ChatType";
import { ChatMemberRole } from "@/types/ChatMemberRole";
// import { useActiveChatAttachments } from "@/stores/messageStore";
// import RenderMedia from "@/components/ui/RenderMedia";
import DirectChat from "./SidebarInfoEdit/DirectChat";
import GroupChat from "./SidebarInfoEdit/GroupChat";

const SidebarInfoDefault: React.FC = () => {
  console.log('SIDEBAR-InfoDefault Rendered')
  const { activeChat } = useChatStore();
  // const activeAttachments = useActiveChatAttachments()
  // const activeAttachments: any[] = [];
  const { setSidebarInfo, isSidebarInfoVisible } = useSidebarInfoStore();

  const isDirect = activeChat?.type === ChatType.DIRECT;

  const openEditSidebar = () => {
    setSidebarInfo(isDirect ? "directEdit" : "groupEdit");
  };

  const baseHeaderIcons = [
    { icon: "notifications", action: () => {} },
    { icon: "search", action: () => {} },
    { icon: "block", action: () => {}, className: "rotate-90" },
  ];

  const showEditButton =
    isDirect ||
    (!isDirect &&
      activeChat &&
      (activeChat.myRole === ChatMemberRole.ADMIN ||
        activeChat.myRole === ChatMemberRole.OWNER));

  const headerIcons = [
    ...baseHeaderIcons,
    ...(showEditButton ? [{ icon: "edit", action: openEditSidebar }] : []),
  ];

  if (!activeChat) return null;

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-around items-center min-h-[var(--header-height)] custom-border-b">
        {headerIcons.map(({ icon, action, className = "" }) => (
          <a
            key={icon}
            className={`flex items-center rounded-full p-2 cursor-pointer opacity-50 hover:opacity-100 ${className}`}
            onClick={action}
          >
            <i className="material-symbols-outlined">{icon}</i>
          </a>
        ))}
      </header>

      <div className="overflow-x-hidden overflow-y-auto h-screen">
        {/* <div className="flex flex-col justify-center items-center p-4 gap-2 w-full pb-[70px]"> */}
        {isSidebarInfoVisible && (
          <motion.div
            key={activeChat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4 w-full mt-4 min-w-[240px]"
          >
            {isDirect ? <DirectChat /> : <GroupChat />}
          </motion.div>
        )}

        <div
          className="flex flex-col justify-center items-center cursor-pointer border-2 border-b-0 border-[var(--hover-color)] rounded p-1 shadow-4xl absolute -bottom-[100px] hover:-bottom-[70px] transition-all duration-300 ease-in-out backdrop-blur-[12px]"
          onClick={() => setSidebarInfo("media")}
        >
          <i className="material-symbols-outlined opacity-70">
            keyboard_control_key
          </i>
          <h1 className="-mt-1 mb-2">Media & Files</h1>
          {/* <div className="grid grid-cols-3">
            {activeAttachments.slice(0, 3).map((media, index) => (
              <div
                key={`${media.messageId}-${index}`}
                className="overflow-hidden aspect-square"
              >
                <RenderMedia
                  media={media}
                  className="hover:none custom-border"
                />
              </div>
            ))}
          </div> */}
        </div>
        {/* </div> */}
      </div>
    </aside>
  );
};

export default SidebarInfoDefault;
